import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
  type SelectChangeEvent
} from '@mui/material';
import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi';

const PERIOD_OPTIONS = [
  { value: 24, label: 'Добова (24 год)' },
  { value: 48, label: '2 доби (48 год)' },
  { value: 168, label: 'Тижнева (168 год)' },
  { value: 12, label: '12 годин' }
];

export const DecompositionTab = () => {
  const { t } = useTranslation();
  const { decompositionData, isLoadingDecomposition, decompositionError, getDecomposition } = useApi();

  const [period, setPeriod] = useState<number>(24);

  useEffect(() => {
    getDecomposition({ period });
  }, [getDecomposition, period]);

  const handleRefresh = () => {
    getDecomposition({ period });
  };

  const getChartData = useCallback(
    (component: 'trend' | 'seasonal' | 'residual') => {
      if (!decompositionData) return [];
      const data = decompositionData.components[component];
      return Object.entries(data).map(([date, value]) => ({
        date,
        value,
        formattedDate: new Date(date).toLocaleDateString()
      }));
    },
    [decompositionData]
  );

  const trendData = useMemo(() => getChartData('trend'), [getChartData]);
  const seasonalData = useMemo(() => getChartData('seasonal'), [getChartData]);
  const residualData = useMemo(() => getChartData('residual'), [getChartData]);

  const renderChart = (data: { date: string; value: number; formattedDate: string }[], color: string) => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="formattedDate"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={60}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            border: 'none',
            borderRadius: '8px'
          }}
          formatter={(value) => [`${((value as number) ?? 0).toFixed(4)} kW`, 'Значення']}
          labelFormatter={(label) => label}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
        <Brush dataKey="formattedDate" height={25} stroke={color} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (isLoadingDecomposition) {
    return <LoadingFallback />;
  }

  if (decompositionError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {decompositionError}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('Період декомпозиції')}</InputLabel>
          <Select
            value={period}
            label={t('Період декомпозиції')}
            onChange={(e: SelectChangeEvent<number>) => setPeriod(e.target.value as number)}
          >
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {t(label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title={t('Оновити')}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {decompositionData && (
        <Stack spacing={3}>
          {/* Summary Cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('Сила тренду')}
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {(decompositionData.summary.trend_strength * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('Сила сезонності')}
                </Typography>
                <Typography variant="h4" color="secondary.main">
                  {(decompositionData.summary.seasonal_strength * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('Амплітуда сезонності')}
                </Typography>
                <Typography variant="h4" color="info.main">
                  {decompositionData.summary.seasonal_amplitude.toFixed(3)} kW
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('Стд. залишків')}
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {decompositionData.summary.residual_std.toFixed(3)}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Period Description */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              <strong>{t('Період')}:</strong> {decompositionData.period_description}
            </Typography>
          </Paper>

          {/* Charts */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Тренд')}
            </Typography>
            {renderChart(trendData, '#1976d2')}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Сезонна компонента')}
            </Typography>
            {renderChart(seasonalData, '#9c27b0')}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Залишки (шум)')}
            </Typography>
            {renderChart(residualData, '#ff9800')}
          </Paper>
        </Stack>
      )}

      {!decompositionData && !isLoadingDecomposition && !decompositionError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Немає даних')}</Typography>
        </Paper>
      )}
    </Box>
  );
};
