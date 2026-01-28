import { useState, useMemo, useEffect } from 'react';
import { Container, Box, Typography, AppBar, Toolbar, Grid } from '@mui/material';
import { FlightTakeoff } from '@mui/icons-material';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import SearchForm from './components/SearchForm';
import FlightResults from './components/FlightResults';
import PriceGraph from './components/PriceGraph';
import FiltersComponent from './components/Filters';
import { SearchParams, Flight, Filters, PriceDataPoint } from './types/flight';
import { searchFlights } from './services/amadeusApi';
import { filterFlights, extractPriceData } from './utils/flightUtils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    stops: null,
    maxPrice: null,
    airlines: [],
  });

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchParams(params);
    setFilters({ stops: null, maxPrice: null, airlines: [] });

    try {
      const results = await searchFlights(params);
      setFlights(results);
      
      if (results.length > 0) {
        setLoadingPrices(true);
        try {
          const data = await extractPriceData(results, params);
          setPriceData(data);
        } catch (err) {
          console.error('Error fetching extended price data:', err);
          const basicData = await extractPriceData(results, undefined);
          setPriceData(basicData);
        } finally {
          setLoadingPrices(false);
        }
      } else {
        setPriceData([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search flights';
      setError(errorMessage);
      setFlights([]);
      setPriceData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlights = useMemo(() => {
    return filterFlights(flights, filters);
  }, [flights, filters]);

  useEffect(() => {
    const updatePriceData = async () => {
      if (filteredFlights.length === 0) {
        setPriceData([]);
        return;
      }

      setLoadingPrices(true);
      try {
        const data = searchParams 
          ? await extractPriceData(filteredFlights, searchParams)
          : await extractPriceData(filteredFlights, undefined);
        setPriceData(data);
      } catch (err) {
        console.error('Error updating price data:', err);
        const basicData = await extractPriceData(filteredFlights, undefined);
        setPriceData(basicData);
      } finally {
        setLoadingPrices(false);
      }
    };

    updatePriceData();
  }, [filteredFlights, searchParams]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <FlightTakeoff sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Flight Search Engine
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <SearchForm onSearch={handleSearch} loading={loading} />

        {hasSearched && (
          <>
            {flights.length > 0 && (
              <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
                <Grid item xs={12} md={4}>
                  <FiltersComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    flights={flights}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <PriceGraph 
                    data={priceData} 
                    currency={flights[0]?.price.currency} 
                    loading={loadingPrices}
                  />
                </Grid>
              </Grid>
            )}

            <FlightResults flights={filteredFlights} loading={loading} error={error} />
          </>
        )}

        {!hasSearched && !loading && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <FlightTakeoff sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom>
              Start your flight search
            </Typography>
            <Typography variant="body2">
              Enter your origin, destination, and dates to find the best flights
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
