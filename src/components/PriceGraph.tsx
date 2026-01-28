import { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PriceDataPoint } from '../types/flight';
import { format, parseISO } from 'date-fns';

interface PriceGraphProps {
  data: PriceDataPoint[];
  currency?: string;
  loading?: boolean;
}

export default function PriceGraph({ data, currency = 'USD', loading = false }: PriceGraphProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      dateLabel: format(parseISO(point.date), 'MMM dd'),
      fullDate: format(parseISO(point.date), 'MMM dd, yyyy'),
      hasFlights: point.count > 0,
      // Use null for dates without flights so the line doesn't connect
      price: point.count > 0 ? point.price : null,
    }));
  }, [data]);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Price Trends
        </Typography>
        <Box
          sx={{
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography>Loading price trends...</Typography>
        </Box>
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Price Trends
        </Typography>
        <Box
          sx={{
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography>No price data available</Typography>
        </Box>
      </Paper>
    );
  }


  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        fullDate: string;
        hasFlights: boolean;
        price: number | null;
        count: number;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasFlights = data.hasFlights;
      
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {data.fullDate}
          </Typography>
          {hasFlights && data.price !== null ? (
            <>
              <Typography variant="body2" color="primary">
                Avg Price: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency,
                }).format(data.price)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Flights: {data.count}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No flights available
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontWeight={600}>
          Price Trends
        </Typography>
        {loading && (
          <Typography variant="caption" color="text.secondary">
            Loading extended prices...
          </Typography>
        )}
      </Box>
      <Box sx={{ width: '100%', height: isMobile ? 250 : 350, mt: 2 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="dateLabel"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: isMobile ? '10px' : '12px' }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              style={{ fontSize: isMobile ? '10px' : '12px' }}
              tickFormatter={(value) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency,
                  notation: 'compact',
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
              formatter={() => 'Average Price'}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 4, fill: theme.palette.primary.main }}
              activeDot={{ r: 6 }}
              name="Average Price"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
