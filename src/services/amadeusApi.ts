import axios, { AxiosError } from 'axios';
import { Flight, SearchParams } from '../types/flight';

// Amadeus API configuration
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

interface AmadeusLocation {
  iataCode: string;
  name: string;
}

// Note: In production, this should be done server-side for security
// For this demo, we'll use client-side token generation
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid
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
    // Set expiry to 5 minutes before actual expiry for safety
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
    
    // Build search parameters according to Amadeus API v2 specification
    const searchParams: Record<string, string | number> = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults,
    };

    // Add return date only if provided (for round-trip)
    if (params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }

    console.log('Searching flights with params:', searchParams);

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
    
    // Log detailed error information
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
      // Token expired, try again
      accessToken = null;
      return searchFlights(params);
    }
    
    // Extract detailed error message
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

/**
 * Fetch flight prices for a specific date (used for price trends)
 * Returns the minimum price found for that date
 */
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

    // Return the minimum price for that date
    const prices = flights.map((flight: Flight) => parseFloat(flight.price.total));
    return Math.min(...prices);
  } catch (error) {
    const axiosError = error as AxiosError;
    // Silently fail for extended date queries - they're optional
    if (axiosError.response?.status !== 401) {
      console.warn(`Failed to fetch price for date ${date}:`, error);
      return null;
    }
    // Token expired, try again
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
    // Log error but don't throw - return empty array so popular airports can still be shown
    if (axiosError.response?.status !== 400) {
      console.error('Error getting airport suggestions:', error);
    }
    return [];
  }
}
