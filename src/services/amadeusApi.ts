import axios, { AxiosError } from 'axios';
import { Flight, SearchParams } from '../types/flight';

const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

interface AmadeusLocation {
  iataCode: string;
  name: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  const clientId = import.meta.env.VITE_AMADEUS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured. Please set VITE_AMADEUS_CLIENT_ID and VITE_AMADEUS_CLIENT_SECRET in your .env file');
  }

  try {
    const response = await axios.post(
      `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = now + (response.data.expires_in - 300) * 1000;
    
    if (!accessToken) {
      throw new Error('Failed to get access token from Amadeus API');
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Amadeus access token:', error);
    throw new Error('Failed to authenticate with Amadeus API');
  }
}

export async function searchFlights(params: SearchParams): Promise<Flight[]> {
  try {
    const token = await getAccessToken();
    
    const searchParams: Record<string, string | number> = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults,
    };

    if (params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }

    const response = await axios.get(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
      {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ errors?: Array<{ detail?: string; source?: { parameter?: string } }> }>;
    
    if (axiosError.response) {
      console.error('API Error Response:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data,
      });
    } else {
      console.error('Error searching flights:', error);
    }
    
    if (axiosError.response?.status === 401) {
      accessToken = null;
      return searchFlights(params);
    }
    
    const errorDetails = axiosError.response?.data?.errors;
    let errorMessage = 'Failed to search flights. Please check your API credentials and try again.';
    
    if (errorDetails && errorDetails.length > 0) {
      const firstError = errorDetails[0];
      errorMessage = firstError.detail || errorMessage;
      if (firstError.source?.parameter) {
        errorMessage += ` (Parameter: ${firstError.source.parameter})`;
      }
    }
    
    throw new Error(errorMessage);
  }
}

export async function getPriceForDate(
  origin: string,
  destination: string,
  date: string,
  adults: number
): Promise<number | null> {
  try {
    const token = await getAccessToken();
    
    const searchParams: Record<string, string | number> = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: adults,
    };

    const response = await axios.get(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
      {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const flights = response.data.data || [];
    if (flights.length === 0) {
      return null;
    }

    const prices = flights.map((flight: Flight) => parseFloat(flight.price.total));
    return Math.min(...prices);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status !== 401) {
      console.warn(`Failed to fetch price for date ${date}:`, error);
      return null;
    }
    accessToken = null;
    return getPriceForDate(origin, destination, date, adults);
  }
}

export async function getAirportSuggestions(query: string): Promise<Array<{ iataCode: string; name: string }>> {
  if (query.length < 2) return [];

  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${AMADEUS_BASE_URL}/v1/reference-data/locations`,
      {
        params: {
          subType: 'AIRPORT',
          keyword: query,
          'page[limit]': 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return (response.data.data || []).map((location: AmadeusLocation) => ({
      iataCode: location.iataCode,
      name: `${location.name} (${location.iataCode})`,
    }));
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status !== 400) {
      console.error('Error getting airport suggestions:', error);
    }
    return [];
  }
}
