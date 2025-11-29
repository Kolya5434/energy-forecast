import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import { LoadingFallback } from '../../../components/LoadingFallback';
import { OptimizedEChart } from '../../../components/OptimizedEChart';
import { useApi } from '../../../context/useApi';

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

  const getChartOption = (component: 'trend' | 'seasonal' | 'residual', color: string, title: string) => {
    if (!decompositionData) return {};

    const data = decompositionData.components[component];
    const entries = Object.entries(data);
    const dates = entries.map(([date]) => date);
    const values = entries.map(([, val]) => val);

    return {
      title: {
        text: title,
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: { value: number; axisValue: string }[]) => {
          const p = params?.[0];
          if (!p) return '';
          return `${new Date(p.axisValue).toLocaleString()}<br/>${p.value.toFixed(4)} kW`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          formatter: (val: string) => {
            const d = new Date(val);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          },
          rotate: 45
        }
      },
      yAxis: { type: 'value', name: 'kW' },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100 }
      ],
      series: [
        {
          type: 'line',
          data: values,
          itemStyle: { color },
          showSymbol: false,
          lineStyle: { width: 1 }
        }
      ]
    };
  };

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
            <OptimizedEChart
              option={getChartOption('trend', '#1976d2', '')}
              style={{ height: 250 }}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Сезонна компонента')}
            </Typography>
            <OptimizedEChart
              option={getChartOption('seasonal', '#9c27b0', '')}
              style={{ height: 250 }}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Залишки (шум)')}
            </Typography>
            <OptimizedEChart
              option={getChartOption('residual', '#ff9800', '')}
              style={{ height: 250 }}
            />
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
