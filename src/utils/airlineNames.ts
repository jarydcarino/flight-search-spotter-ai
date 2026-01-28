// Mapping of IATA airline codes to airline names
export const AIRLINE_NAMES: Record<string, string> = {
  // Major US Airlines
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'AS': 'Alaska Airlines',
  'B6': 'JetBlue Airways',
  'WN': 'Southwest Airlines',
  'F9': 'Frontier Airlines',
  'NK': 'Spirit Airlines',
  'SY': 'Sun Country Airlines',
  'G4': 'Allegiant Air',
  
  // International Airlines
  'BA': 'British Airways',
  'AF': 'Air France',
  'LH': 'Lufthansa',
  'KL': 'KLM Royal Dutch Airlines',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'JL': 'Japan Airlines',
  'NH': 'All Nippon Airways',
  'KE': 'Korean Air',
  'QF': 'Qantas',
  'AC': 'Air Canada',
  'AM': 'Aeroméxico',
  'LA': 'LATAM Airlines',
  'IB': 'Iberia',
  'LX': 'Swiss International Air Lines',
  'OS': 'Austrian Airlines',
  'SN': 'Brussels Airlines',
  'TP': 'TAP Air Portugal',
  'TK': 'Turkish Airlines',
  'ET': 'Ethiopian Airlines',
  'SA': 'South African Airways',
  'NZ': 'Air New Zealand',
  'TG': 'Thai Airways',
  'MH': 'Malaysia Airlines',
  'PR': 'Philippine Airlines',
  'CI': 'China Airlines',
  'BR': 'EVA Air',
  'OZ': 'Asiana Airlines',
  'VS': 'Virgin Atlantic',
  'AY': 'Finnair',
  'SK': 'SAS Scandinavian Airlines',
  'LO': 'LOT Polish Airlines',
  
  // Regional and Low-Cost Carriers
  'HA': 'Hawaiian Airlines',
  'VX': 'Virgin America',
  '9E': 'Endeavor Air',
  'YX': 'Republic Airways',
  'OO': 'SkyWest Airlines',
  'MQ': 'Envoy Air',
  'YV': 'Mesa Airlines',
  '9K': 'Cape Air',
  'EV': 'ExpressJet',
  'CP': 'Compass Airlines',
  'OH': 'PSA Airlines',
  'ZW': 'Air Wisconsin',
  'QX': 'Horizon Air',
  
  // Other codes that might appear
  '6X': 'Amadeus IT Group (Test)',
  '1X': 'Unknown Airline',
  '2X': 'Unknown Airline',
  '3X': 'Unknown Airline',
  '4X': 'Unknown Airline',
  '5X': 'Unknown Airline',
  '7X': 'Unknown Airline',
  '8X': 'Unknown Airline',
};

/**
 * Get the airline name for a given IATA code
 * @param code - IATA airline code (e.g., "AS", "AA")
 * @returns Airline name or the code itself if not found
 */
export function getAirlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

/**
 * Format airline code with name for display
 * @param code - IATA airline code
 * @returns Formatted string like "AS - Alaska Airlines" or just "AS" if name not found
 */
export function formatAirlineDisplay(code: string): string {
  const name = getAirlineName(code);
  if (name === code) {
    return code;
  }
  return `${code} - ${name}`;
}
