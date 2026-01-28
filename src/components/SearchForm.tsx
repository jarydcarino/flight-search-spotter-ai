import { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Typography,
  InputAdornment,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Search as SearchIcon, FlightTakeoff, FlightLand } from '@mui/icons-material';
import { SearchParams } from '../types/flight';
import { getAirportSuggestions } from '../services/amadeusApi';
import { filterPopularAirports, POPULAR_AIRPORTS, AirportOption } from '../utils/popularAirports';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

type TripType = 'one-way' | 'round-trip';

export default function SearchForm({ onSearch, loading = false }: SearchFormProps) {
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [origin, setOrigin] = useState<AirportOption | null>(null);
  const [destination, setDestination] = useState<AirportOption | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);

  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [originOptions, setOriginOptions] = useState<AirportOption[]>(POPULAR_AIRPORTS);
  const [destinationOptions, setDestinationOptions] = useState<AirportOption[]>(POPULAR_AIRPORTS);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  useEffect(() => {
    // Always show filtered popular airports
    const filteredPopular = filterPopularAirports(originInput);
    
    if (originInput.length >= 2) {
      setOriginLoading(true);
      const timer = setTimeout(() => {
        getAirportSuggestions(originInput).then((apiResults) => {
          // Combine popular airports with API results, removing duplicates
          const combined = [...filteredPopular];
          apiResults.forEach((apiResult) => {
            if (!combined.some((item) => item.iataCode === apiResult.iataCode)) {
              combined.push(apiResult);
            }
          });
          setOriginOptions(combined);
          setOriginLoading(false);
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        setOriginLoading(false);
      };
    } else {
      // Show filtered popular airports when input is less than 2 characters
      setOriginOptions(filteredPopular);
    }
  }, [originInput]);

  useEffect(() => {
    // Always show filtered popular airports
    const filteredPopular = filterPopularAirports(destinationInput);
    
    if (destinationInput.length >= 2) {
      setDestinationLoading(true);
      const timer = setTimeout(() => {
        getAirportSuggestions(destinationInput).then((apiResults) => {
          // Combine popular airports with API results, removing duplicates
          const combined = [...filteredPopular];
          apiResults.forEach((apiResult) => {
            if (!combined.some((item) => item.iataCode === apiResult.iataCode)) {
              combined.push(apiResult);
            }
          });
          setDestinationOptions(combined);
          setDestinationLoading(false);
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        setDestinationLoading(false);
      };
    } else {
      // Show filtered popular airports when input is less than 2 characters
      setDestinationOptions(filteredPopular);
    }
  }, [destinationInput]);

  const handleTripTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTripType = event.target.value as TripType;
    setTripType(newTripType);
    if (newTripType === 'one-way') {
      setReturnDate(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!origin || !destination || !departureDate) {
      return;
    }

    // For round-trip, return date is required
    if (tripType === 'round-trip' && !returnDate) {
      alert('Please select a return date for round-trip flights');
      return;
    }

    const params: SearchParams = {
      origin: origin.iataCode,
      destination: destination.iataCode,
      departureDate: departureDate.toISOString().split('T')[0],
      adults,
    };

    // Add return date for round-trip
    if (tripType === 'round-trip' && returnDate) {
      params.returnDate = returnDate.toISOString().split('T')[0];
    }

    console.log('Submitting search with params:', params);
    onSearch(params);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Search Flights
        </Typography>
        <form onSubmit={handleSubmit}>
          {/* Trip Type Radio Buttons */}
          <Box sx={{ mb: 3 }}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={tripType}
                onChange={handleTripTypeChange}
                sx={{ justifyContent: 'center' }}
              >
                <FormControlLabel
                  value="one-way"
                  control={<Radio />}
                  label="One-way"
                />
                <FormControlLabel
                  value="round-trip"
                  control={<Radio />}
                  label="Round-trip"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={originOptions}
                getOptionLabel={(option) => option.name}
                value={origin}
                onChange={(_, newValue) => setOrigin(newValue)}
                inputValue={originInput}
                onInputChange={(_, newValue) => setOriginInput(newValue)}
                loading={originLoading}
                isOptionEqualToValue={(option, value) => option.iataCode === value.iataCode}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From"
                    required
                    placeholder="Search airports..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <FlightTakeoff color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {originLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="No airports found"
                openOnFocus
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={destinationOptions}
                getOptionLabel={(option) => option.name}
                value={destination}
                onChange={(_, newValue) => setDestination(newValue)}
                inputValue={destinationInput}
                onInputChange={(_, newValue) => setDestinationInput(newValue)}
                loading={destinationLoading}
                isOptionEqualToValue={(option, value) => option.iataCode === value.iataCode}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To"
                    required
                    placeholder="Search airports..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <FlightLand color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {destinationLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="No airports found"
                openOnFocus
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Departure"
                value={departureDate}
                onChange={(newValue) => setDepartureDate(newValue)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Return"
                value={returnDate}
                onChange={(newValue) => setReturnDate(newValue)}
                minDate={departureDate || new Date()}
                disabled={tripType === 'one-way'}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: tripType === 'round-trip',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Adults"
                type="number"
                value={adults}
                onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 9 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<SearchIcon />}
                sx={{ py: 1.5, mt: 1 }}
              >
                {loading ? 'Searching...' : 'Search Flights'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
}
