import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Filters as FiltersType } from '../types/flight';
import { Flight } from '../types/flight';
import { formatAirlineDisplay } from '../utils/airlineNames';
import { formatPrice } from '../utils/flightUtils';

interface FiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  flights: Flight[];
}

export default function FiltersComponent({ filters, onFiltersChange, flights }: FiltersProps) {
  // Get currency from flights (all flights should have the same currency)
  const currency = useMemo(() => {
    return flights.length > 0 ? flights[0].price.currency : 'USD';
  }, [flights]);

  // Memoize available airlines calculation
  const availableAirlines = useMemo(() => {
    if (flights.length === 0) return [];
    const airlines = new Set<string>();
    flights.forEach((flight) => {
      flight.validatingAirlineCodes.forEach((code) => airlines.add(code));
    });
    return Array.from(airlines).sort();
  }, [flights]);

  // Memoize price range calculation
  const priceRange = useMemo<[number, number]>(() => {
    if (flights.length === 0) return [0, 10000];
    const prices = flights.map((f) => parseFloat(f.price.total));
    return [Math.min(...prices), Math.max(...prices)];
  }, [flights]);

  // Local state for slider to debounce updates
  const [sliderValue, setSliderValue] = useState(filters.maxPrice ?? priceRange[1]);
  const debounceTimerRef = useRef<number | null>(null);

  // Sync slider value when filters.maxPrice or priceRange changes externally
  useEffect(() => {
    setSliderValue(filters.maxPrice ?? priceRange[1]);
  }, [filters.maxPrice, priceRange]);

  // Update max price if current is higher than available max (only when price range changes)
  useEffect(() => {
    if (filters.maxPrice && filters.maxPrice > priceRange[1] && priceRange[1] > 0) {
      const newFilters = { ...filters, maxPrice: priceRange[1] };
      onFiltersChange(newFilters);
      setSliderValue(priceRange[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange[1]]); // Only update when price range changes

  // Memoize handlers to prevent unnecessary re-renders
  const handleStopsChange = useCallback((stops: number | null) => {
    onFiltersChange({ ...filters, stops });
  }, [filters, onFiltersChange]);

  const handlePriceChange = useCallback((_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[1] : newValue;
    setSliderValue(value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce the actual filter update
    debounceTimerRef.current = window.setTimeout(() => {
      onFiltersChange({ ...filters, maxPrice: value });
    }, 150); // 150ms debounce for smoother UX
  }, [filters, onFiltersChange]);

  const handleAirlinesChange = useCallback((event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      airlines: typeof value === 'string' ? value.split(',') : value,
    });
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setSliderValue(priceRange[1]);
    onFiltersChange({
      stops: null,
      maxPrice: null,
      airlines: [],
    });
  }, [onFiltersChange, priceRange[1]]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasActiveFilters =
    filters.stops !== null || filters.maxPrice !== null || filters.airlines.length > 0;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        {hasActiveFilters && (
          <Chip
            label="Clear All"
            onClick={clearFilters}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom fontWeight={500}>
          Stops
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label="Any"
            onClick={() => handleStopsChange(null)}
            color={filters.stops === null ? 'primary' : 'default'}
            variant={filters.stops === null ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Non-stop"
            onClick={() => handleStopsChange(0)}
            color={filters.stops === 0 ? 'primary' : 'default'}
            variant={filters.stops === 0 ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="1 Stop"
            onClick={() => handleStopsChange(1)}
            color={filters.stops === 1 ? 'primary' : 'default'}
            variant={filters.stops === 1 ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="2+ Stops"
            onClick={() => handleStopsChange(2)}
            color={filters.stops === 2 ? 'primary' : 'default'}
            variant={filters.stops === 2 ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom fontWeight={500}>
          Max Price: {filters.maxPrice ? formatPrice(filters.maxPrice.toString(), currency) : 'No limit'}
        </Typography>
        <Slider
          value={sliderValue}
          onChange={handlePriceChange}
          min={priceRange[0]}
          max={priceRange[1]}
          step={50}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatPrice(value.toString(), currency)}
          sx={{ mb: 1 }}
        />
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ 
            width: '100%',
            px: 0.5,
            mt: 0.5,
          }}
        >
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontSize: '0.75rem',
              wordBreak: 'break-word',
              maxWidth: '45%',
            }}
          >
            {formatPrice(priceRange[0].toString(), currency)}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontSize: '0.75rem',
              wordBreak: 'break-word',
              maxWidth: '45%',
              textAlign: 'right',
            }}
          >
            {formatPrice(priceRange[1].toString(), currency)}
          </Typography>
        </Box>
      </Box>

      <Box>
        <FormControl fullWidth>
          <InputLabel>Airlines</InputLabel>
          <Select
            multiple
            value={filters.airlines}
            onChange={handleAirlinesChange}
            input={<OutlinedInput label="Airlines" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={formatAirlineDisplay(value)} size="small" />
                ))}
              </Box>
            )}
          >
            {availableAirlines.map((airline) => (
              <MenuItem key={airline} value={airline}>
                <Checkbox checked={filters.airlines.indexOf(airline) > -1} />
                <ListItemText primary={formatAirlineDisplay(airline)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}
