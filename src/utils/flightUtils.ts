import { Flight, Filters, PriceDataPoint, SearchParams } from '../types/flight';
import { format, parseISO, addDays } from 'date-fns';
import { getPriceForDate } from '../services/amadeusApi';

export function filterFlights(flights: Flight[], filters: Filters): Flight[] {
  return flights.filter((flight) => {
    // Filter by stops
    if (filters.stops !== null) {
      const maxStops = Math.max(
        ...flight.itineraries.map((itinerary) =>
          Math.max(...itinerary.segments.map((seg) => seg.numberOfStops))
        )
      );
      if (maxStops !== filters.stops) {
        return false;
      }
    }

    // Filter by max price
    if (filters.maxPrice !== null) {
      const price = parseFloat(flight.price.total);
      if (price > filters.maxPrice) {
        return false;
      }
    }

    // Filter by airlines
    if (filters.airlines.length > 0) {
      const flightAirlines = flight.validatingAirlineCodes;
      const hasMatchingAirline = flightAirlines.some((airline) =>
        filters.airlines.includes(airline)
      );
      if (!hasMatchingAirline) {
        return false;
      }
    }

    return true;
  });
}

export async function extractPriceData(
  flights: Flight[],
  searchParams?: SearchParams
): Promise<PriceDataPoint[]> {
  if (flights.length === 0) {
    return [];
  }

  // Group prices by date
  const priceMap = new Map<string, { total: number; count: number }>();
  flights.forEach((flight) => {
    const price = parseFloat(flight.price.total);
    const date = format(parseISO(flight.itineraries[0].segments[0].departure.at), 'yyyy-MM-dd');
    
    const existing = priceMap.get(date) || { total: 0, count: 0 };
    priceMap.set(date, {
      total: existing.total + price,
      count: existing.count + 1,
    });
  });

  // Find date range
  const flightDates = flights.map((flight) => 
    parseISO(flight.itineraries[0].segments[0].departure.at)
  );
  const earliestDate = new Date(Math.min(...flightDates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...flightDates.map(d => d.getTime())));
  const endDate = addDays(latestDate, 5);

  // Build price data array
  const allDates: PriceDataPoint[] = [];
  let currentDate = new Date(earliestDate);
  
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const flightData = priceMap.get(dateStr);
    
    allDates.push({
      date: dateStr,
      price: flightData ? Math.round(flightData.total / flightData.count) : null,
      count: flightData ? flightData.count : 0,
    });
    
    currentDate = addDays(currentDate, 1);
  }

  // Fetch prices for dates without flights
  if (searchParams) {
    const datesToFetch = allDates
      .map((dataPoint, index) => ({ dataPoint, index }))
      .filter(({ dataPoint }) => dataPoint.price === null);

    const BATCH_SIZE = 5;
    for (let i = 0; i < datesToFetch.length; i += BATCH_SIZE) {
      const batch = datesToFetch.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async ({ dataPoint, index }) => {
        try {
          const price = await getPriceForDate(
            searchParams.origin,
            searchParams.destination,
            dataPoint.date,
            searchParams.adults
          );
          if (price !== null) {
            allDates[index].price = Math.round(price);
            allDates[index].count = 1;
          }
        } catch (error) {
          // Silently fail for optional extended dates
        }
      });

      await Promise.allSettled(promises);
      
      if (i + BATCH_SIZE < datesToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  return allDates;
}

export function getAllAirlines(flights: Flight[]): string[] {
  const airlines = new Set<string>();
  flights.forEach((flight) => {
    flight.validatingAirlineCodes.forEach((code) => airlines.add(code));
  });
  return Array.from(airlines).sort();
}

export function getMinMaxPrice(flights: Flight[]): { min: number; max: number } {
  if (flights.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = flights.map((flight) => parseFloat(flight.price.total));
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function formatDuration(duration: string): string {
  // Duration format: PT2H30M
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function formatPrice(price: string, currency: string): string {
  const numPrice = parseFloat(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(numPrice);
}
