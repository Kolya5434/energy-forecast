import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

import { Box, Typography } from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { COLORS } from '@/shared/constans';
import type { SimulationChartData } from '@/types/api';

interface SimulationChartProps {
  chartData: SimulationChartData[];
  isLoading: boolean;
}

export const SimulationChart = memo(({ chartData, isLoading }: SimulationChartProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box sx={{ height: 400 }}>
        <LoadingFallback />
      </Box>
    );
  }

  if (chartData.length === 0) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">{t('Задайте параметри та запустіть симуляцію.')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} role="img" aria-label={t('Графік симуляції енергоспоживання')}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip
            contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: 'none', borderRadius: '8px' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="baseForecast"
            name={t('Базовий Прогноз')}
            stroke={COLORS[0]}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="simulatedForecast"
            name={t('Симульований Прогноз')}
            stroke={COLORS[1]}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
});

SimulationChart.displayName = 'SimulationChart';
