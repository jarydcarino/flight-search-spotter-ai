import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  Schedule,
  AirlineStops,
  SearchOff,
} from '@mui/icons-material';
import { useState, useMemo, useEffect } from 'react';
import { Flight } from '../types/flight';
import { formatDuration, formatPrice } from '../utils/flightUtils';
import { format, parseISO } from 'date-fns';

interface FlightResultsProps {
  flights: Flight[];
  loading?: boolean;
  error?: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function FlightResults({ flights, loading, error }: FlightResultsProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 when flights change
  useEffect(() => {
    setPage(1);
  }, [flights]);

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(flights.length / ITEMS_PER_PAGE);
  }, [flights.length]);

  // Get paginated flights
  const paginatedFlights = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return flights.slice(startIndex, endIndex);
  }, [flights, page]);

  // Calculate display range
  const displayRange = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(page * ITEMS_PER_PAGE, flights.length);
    return { start, end };
  }, [page, flights.length]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top of results when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (flights.length === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <SearchOff 
          sx={{ 
            fontSize: 64, 
            color: 'text.secondary',
            opacity: 0.5,
          }} 
        />
        <Typography variant="h5" fontWeight={600} color="text.primary">
          No Flights Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          We couldn't find any flights matching your search criteria. Try adjusting your:
        </Typography>
        <Box 
          component="ul" 
          sx={{ 
            textAlign: 'left', 
            color: 'text.secondary',
            pl: 3,
            mt: 1,
          }}
        >
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Origin or destination airports
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Travel dates
          </Typography>
          <Typography component="li" variant="body2">
            Filters (stops, price range, airlines)
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          {flights.length} Flight{flights.length !== 1 ? 's' : ''} Found
        </Typography>
        {flights.length > ITEMS_PER_PAGE && (
          <Typography variant="body2" color="text.secondary">
            Showing {displayRange.start}-{displayRange.end} of {flights.length}
          </Typography>
        )}
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {paginatedFlights.map((flight, index) => (
          <Grid item xs={12} key={flight.id || index}>
            <FlightCard flight={flight} />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}

function FlightCard({ flight }: { flight: Flight }) {
  const isRoundTrip = flight.itineraries.length > 1;
  const outboundItinerary = flight.itineraries[0];
  const returnItinerary = flight.itineraries[1];
  
  const totalPrice = parseFloat(flight.price.total);
  const estimatedPricePerFlight = isRoundTrip ? totalPrice / 2 : totalPrice;

  return (
    <Card elevation={2} sx={{ '&:hover': { elevation: 4 } }}>
      <CardContent>
        <Grid container spacing={2} alignItems={isRoundTrip ? 'flex-start' : 'center'}>
          {/* Price - Prominent on mobile */}
          <Grid item xs={12} sm={3} order={{ xs: 1, sm: 1 }}>
            <Box textAlign="left">
              {isRoundTrip ? (
                <>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    {formatPrice(flight.price.total, flight.price.currency)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Total (Round-trip)
                  </Typography>
                  <Box mt={1.5} pt={1.5} borderTop="1px solid" borderColor="divider">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estimated per flight:
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                      {formatPrice(estimatedPricePerFlight.toFixed(2), flight.price.currency)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    {formatPrice(flight.price.total, flight.price.currency)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {flight.numberOfBookableSeats} seats available
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          {/* Flight Details */}
          <Grid item xs={12} sm={9} order={{ xs: 2, sm: 2 }}>
            {/* Outbound Flight */}
            <Box mb={isRoundTrip ? 3 : 0}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                {isRoundTrip && (
                  <Typography variant="subtitle2" fontWeight={600} color="primary">
                    Outbound Flight
                  </Typography>
                )}
                {isRoundTrip && (
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {formatPrice(estimatedPricePerFlight.toFixed(2), flight.price.currency)}
                  </Typography>
                )}
              </Box>
              <ItineraryDisplay itinerary={outboundItinerary} />
            </Box>

            {/* Return Flight */}
            {isRoundTrip && returnItinerary && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                      Return Flight
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {formatPrice(estimatedPricePerFlight.toFixed(2), flight.price.currency)}
                    </Typography>
                  </Box>
                  <ItineraryDisplay itinerary={returnItinerary} />
                </Box>
              </>
            )}

            {/* Airlines */}
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Airlines
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {flight.validatingAirlineCodes.map((code) => (
                  <Chip
                    key={code}
                    label={code}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function ItineraryDisplay({ itinerary }: { itinerary: import('../types/flight').Itinerary }) {
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];
  const maxStops = Math.max(...itinerary.segments.map((seg) => seg.numberOfStops));

  return (
    <>
      <Grid container spacing={2}>
        {/* Departure */}
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <FlightTakeoff color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Departure
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {format(parseISO(firstSegment.departure.at), 'HH:mm')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {firstSegment.departure.iataCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(parseISO(firstSegment.departure.at), 'MMM dd, yyyy')}
          </Typography>
        </Grid>

        {/* Duration & Stops */}
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Schedule color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Duration
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={500}>
            {formatDuration(itinerary.duration)}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            {maxStops === 0 ? (
              <Chip
                label="Non-stop"
                size="small"
                color="success"
                variant="outlined"
              />
            ) : (
              <>
                <AirlineStops fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {maxStops} stop{maxStops !== 1 ? 's' : ''}
                </Typography>
              </>
            )}
          </Box>
        </Grid>

        {/* Arrival */}
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <FlightLand color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Arrival
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {format(parseISO(lastSegment.arrival.at), 'HH:mm')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lastSegment.arrival.iataCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(parseISO(lastSegment.arrival.at), 'MMM dd, yyyy')}
          </Typography>
        </Grid>

        {/* Segments Count */}
        <Grid item xs={6} sm={3}>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Segments
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {itinerary.segments.length} segment{itinerary.segments.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Segments Detail */}
      {itinerary.segments.length > 1 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Flight Details:
            </Typography>
            {itinerary.segments.map((segment, idx) => (
              <Box key={idx} mt={1}>
                <Typography variant="body2">
                  {segment.departure.iataCode} → {segment.arrival.iataCode} •{' '}
                  {formatDuration(segment.duration)} • {segment.carrierCode}
                  {segment.number}
                  {segment.numberOfStops > 0 && ` • ${segment.numberOfStops} stop${segment.numberOfStops !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </>
  );
}
