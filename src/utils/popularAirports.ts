export interface AirportOption {
  iataCode: string;
  name: string;
}

// Popular airports list for immediate selection
export const POPULAR_AIRPORTS: AirportOption[] = [
  // US Major Airports
  { iataCode: 'JFK', name: 'John F. Kennedy International Airport (JFK)' },
  { iataCode: 'LAX', name: 'Los Angeles International Airport (LAX)' },
  { iataCode: 'ORD', name: "O'Hare International Airport (ORD)" },
  { iataCode: 'DFW', name: 'Dallas/Fort Worth International Airport (DFW)' },
  { iataCode: 'DEN', name: 'Denver International Airport (DEN)' },
  { iataCode: 'SFO', name: 'San Francisco International Airport (SFO)' },
  { iataCode: 'SEA', name: 'Seattle-Tacoma International Airport (SEA)' },
  { iataCode: 'LAS', name: 'McCarran International Airport (LAS)' },
  { iataCode: 'MIA', name: 'Miami International Airport (MIA)' },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport (ATL)' },
  { iataCode: 'BOS', name: 'Logan International Airport (BOS)' },
  { iataCode: 'EWR', name: 'Newark Liberty International Airport (EWR)' },
  { iataCode: 'LGA', name: 'LaGuardia Airport (LGA)' },
  { iataCode: 'PHX', name: 'Phoenix Sky Harbor International Airport (PHX)' },
  { iataCode: 'IAH', name: 'George Bush Intercontinental Airport (IAH)' },
  { iataCode: 'MCO', name: 'Orlando International Airport (MCO)' },
  { iataCode: 'CLT', name: 'Charlotte Douglas International Airport (CLT)' },
  { iataCode: 'MSP', name: 'Minneapolis-Saint Paul International Airport (MSP)' },
  { iataCode: 'DTW', name: 'Detroit Metropolitan Airport (DTW)' },
  { iataCode: 'PHL', name: 'Philadelphia International Airport (PHL)' },
  
  // International Major Airports
  { iataCode: 'LHR', name: 'London Heathrow Airport (LHR)' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport (CDG)' },
  { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol (AMS)' },
  { iataCode: 'FRA', name: 'Frankfurt Airport (FRA)' },
  { iataCode: 'DXB', name: 'Dubai International Airport (DXB)' },
  { iataCode: 'SIN', name: 'Singapore Changi Airport (SIN)' },
  { iataCode: 'HKG', name: 'Hong Kong International Airport (HKG)' },
  { iataCode: 'NRT', name: 'Narita International Airport (NRT)' },
  { iataCode: 'ICN', name: 'Incheon International Airport (ICN)' },
  { iataCode: 'SYD', name: 'Sydney Kingsford Smith Airport (SYD)' },
  { iataCode: 'YYZ', name: 'Toronto Pearson International Airport (YYZ)' },
  { iataCode: 'YVR', name: 'Vancouver International Airport (YVR)' },
  { iataCode: 'MEX', name: 'Mexico City International Airport (MEX)' },
  { iataCode: 'GRU', name: 'São Paulo/Guarulhos International Airport (GRU)' },
  { iataCode: 'DOH', name: 'Hamad International Airport (DOH)' },
  { iataCode: 'IST', name: 'Istanbul Airport (IST)' },
  { iataCode: 'MAD', name: 'Madrid-Barajas Airport (MAD)' },
  { iataCode: 'BCN', name: 'Barcelona-El Prat Airport (BCN)' },
  { iataCode: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport (FCO)' },
];

// Filter popular airports by search query
export function filterPopularAirports(query: string): AirportOption[] {
  if (!query || query.length === 0) {
    return POPULAR_AIRPORTS;
  }
  
  const lowerQuery = query.toLowerCase();
  return POPULAR_AIRPORTS.filter(
    (airport) =>
      airport.iataCode.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery)
  );
}
