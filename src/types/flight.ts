export interface Flight {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Itinerary[];
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
}

export interface Filters {
  stops: number | null; // null = any, 0 = non-stop, 1 = one stop, etc.
  maxPrice: number | null;
  airlines: string[];
}

export interface PriceDataPoint {
  date: string;
  price: number | null; // null for dates without flights
  count: number;
}
