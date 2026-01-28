import { useState, useEffect, useRef } from 'react';
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
  const currency = flights.length > 0 ? flights[0].price.currency : 'USD';

  // Get unique airlines from flights
  const airlineSet = new Set<string>();
  flights.forEach((flight) => {
    flight.validatingAirlineCodes.forEach((code) => airlineSet.add(code));
  });
  const availableAirlines = Array.from(airlineSet).sort();

  // Calculate price range
  let minPrice = 0;
  let maxPrice = 10000;
  if (flights.length > 0) {
    const prices = flights.map((f) => parseFloat(f.price.total));
    minPrice = Math.min(...prices);
    maxPrice = Math.max(...prices);
  }

  const [sliderValue, setSliderValue] = useState(filters.maxPrice ?? maxPrice);
  const debounceTimer = useRef<number | null>(null);

  // Sync slider when filters change
  useEffect(() => {
    setSliderValue(filters.maxPrice ?? maxPrice);
  }, [filters.maxPrice, maxPrice]);

  // Adjust max price if it's higher than available
  useEffect(() => {
    if (filters.maxPrice && filters.maxPrice > maxPrice && maxPrice > 0) {
      const newFilters = { ...filters, maxPrice };
      onFiltersChange(newFilters);
      setSliderValue(maxPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPrice]);

  const handleStopsChange = (stops: number | null) => {
    onFiltersChange({ ...filters, stops });
  };

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[1] : newValue;
    setSliderValue(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = window.setTimeout(() => {
      onFiltersChange({ ...filters, maxPrice: value });
    }, 150);
  };

  const handleAirlinesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      airlines: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const clearFilters = () => {
    setSliderValue(maxPrice);
    onFiltersChange({
      stops: null,
      maxPrice: null,
      airlines: [],
    });
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
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
          min={minPrice}
          max={maxPrice}
          step={50}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatPrice(value.toString(), currency)}
          sx={{ mb: 1 }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%', px: 0.5, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', maxWidth: '45%' }}>
            {formatPrice(minPrice.toString(), currency)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', maxWidth: '45%', textAlign: 'right' }}>
            {formatPrice(maxPrice.toString(), currency)}
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
