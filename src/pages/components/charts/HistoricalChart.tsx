import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip as MuiTooltip,
  Typography
} from '@mui/material';

import { LoadingFallback } from '../../../components/LoadingFallback';
import { useApi } from '../../../context/useApi';

interface HistoricalChartProps {
  days?: number;
  onDaysChange?: (days: number) => void;
}

export const HistoricalChart = ({ days = 30, onDaysChange }: HistoricalChartProps) => {
  const { t } = useTranslation();
  const { historicalData, isLoadingHistorical, historicalError, getHistorical } = useApi();

  useEffect(() => {
    getHistorical({ days, include_stats: true });
  }, [days, getHistorical]);

  const chartData = useMemo(() => {
    if (!historicalData?.values) return [];
    return Object.entries(historicalData.values)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historicalData]);

  const handleRefresh = () => {
    getHistorical({ days, include_stats: true });
  };

  if (historicalError) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography color="error">{historicalError}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{t('Історичні дані споживання')}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>{t('Період')}</InputLabel>
              <Select
                value={days}
                label={t('Період')}
                onChange={(e) => onDaysChange?.(Number(e.target.value))}
              >
                <MenuItem value={7}>{t('7 днів')}</MenuItem>
                <MenuItem value={14}>{t('14 днів')}</MenuItem>
                <MenuItem value={30}>{t('30 днів')}</MenuItem>
                <MenuItem value={90}>{t('90 днів')}</MenuItem>
                <MenuItem value={365}>{t('365 днів')}</MenuItem>
              </Select>
            </FormControl>
            <MuiTooltip title={t('Оновити')}>
              <IconButton size="small" onClick={handleRefresh} disabled={isLoadingHistorical}>
                <RefreshIcon />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Stack>

        {/* Statistics cards */}
        {historicalData?.statistics && (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <StatCard label={t('Мінімум')} value={historicalData.statistics.min.toFixed(2)} unit="kWh" />
            <StatCard label={t('Максимум')} value={historicalData.statistics.max.toFixed(2)} unit="kWh" />
            <StatCard label={t('Середнє')} value={historicalData.statistics.mean.toFixed(2)} unit="kWh" />
            <StatCard label={t('Медіана')} value={historicalData.statistics.median.toFixed(2)} unit="kWh" />
            <StatCard label={t('Стд. відхилення')} value={historicalData.statistics.std.toFixed(2)} unit="kWh" />
          </Stack>
        )}

        {/* Chart */}
        <Box sx={{ height: 250 }}>
          {isLoadingHistorical ? (
            <LoadingFallback />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 30, 0.9)',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value.toFixed(2) + ' kWh', t('Споживання')]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">{t('Немає даних')}</Typography>
            </Box>
          )}
        </Box>

        {/* Date range info */}
        {historicalData?.date_range && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {t('Період')}: {historicalData.date_range.start} — {historicalData.date_range.end} ({historicalData.data_points} {t('точок даних')})
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for statistics
const StatCard = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: 'background.default',
      minWidth: 100,
      textAlign: 'center'
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="medium">
      {value} <Typography component="span" variant="caption">{unit}</Typography>
    </Typography>
  </Box>
);
