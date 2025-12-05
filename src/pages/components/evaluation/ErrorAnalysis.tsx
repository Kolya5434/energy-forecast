import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Bar
} from 'recharts';

import { Box, Stack, Typography } from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { CHART_MARGIN, TOOLTIP_STYLE_ERRORS } from '@/shared/constans';
import type { IEvaluationApiResponse } from '@/types/api';

interface ErrorAnalysisProps {
  selectedModelId: string;
  evaluation: IEvaluationApiResponse | undefined;
  isLoading: boolean;
}

export const ErrorAnalysis = memo(({ selectedModelId, evaluation, isLoading }: ErrorAnalysisProps) => {
  const { t } = useTranslation();

  if (!selectedModelId) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {t('Будь ласка, виберіть одну модель для аналізу помилок.')}
      </Typography>
    );
  }

  if (!evaluation || !evaluation.error_analysis) {
    if (isLoading) return <LoadingFallback />;
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {t('Дані аналізу помилок недоступні для цієї моделі.')}
      </Typography>
    );
  }

  const { residuals_over_time, monthly_errors, scatter_data } = evaluation.error_analysis;

  const minValue = Math.min(...scatter_data.map((d) => Math.min(d.actual, d.predicted)));
  const maxValue = Math.max(...scatter_data.map((d) => Math.max(d.actual, d.predicted)));

  return (
    <Stack spacing={4} sx={{ mt: 2 }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('Помилки (залишки) моделі у часі')}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={residuals_over_time} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: t('Помилка'), angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE_ERRORS} />
            <Legend />
            <Line
              type="monotone"
              dataKey="residual"
              name={t('Залишок')}
              stroke="#ff8042"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label={t('Zero')} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          {t('Розподіл помилок по місяцях (Box Plot)')}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthly_errors} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" name={t('Місяць')} />
            <YAxis label={{ value: t('Помилка'), angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE_ERRORS} />
            <Legend />
            <Bar dataKey="q1" fill="#90caf9" name="Q1" stackId="a" strokeWidth={0} />
            <Bar
              dataKey={(entry: { q1: number; q3: number }) => entry.q3 - entry.q1}
              fill="#1976d2"
              name={t('IQR (Q1-Q3)')}
              stackId="a"
              strokeWidth={0}
            />
            <Scatter dataKey="median" fill="#d32f2f" name={t('Median')} shape="diamond" />
            <Scatter dataKey="min" fill="#f44336" name={t('Min')} shape="cross" />
            <Scatter dataKey="max" fill="#f44336" name={t('Max')} shape="cross" />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          {t('Фактичні vs Прогнозовані значення')}
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ ...CHART_MARGIN, right: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="actual"
              type="number"
              name={t('Фактичні')}
              label={{ value: t('Фактичні'), position: 'bottom', offset: -5 }}
              domain={[minValue, maxValue]}
            />
            <YAxis
              dataKey="predicted"
              type="number"
              name={t('Прогнозовані')}
              label={{ value: t('Прогнозовані'), angle: -90, position: 'insideLeft' }}
              domain={[minValue, maxValue]}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE_ERRORS}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number) => value.toFixed(2)}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '10px' }} />
            <Scatter name={t('Точки даних')} data={scatter_data} fill="#8884d8" fillOpacity={0.6} shape="circle" />
            <ReferenceLine
              segment={[
                { x: minValue, y: minValue },
                { x: maxValue, y: maxValue }
              ]}
              stroke="#ff5252"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: t('Ідеальна лінія'), position: 'insideTopRight', fill: '#ff5252' }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {t('* Червона пунктирна лінія показує ідеальний прогноз (фактичні = прогнозовані)')}
        </Typography>
      </Box>
    </Stack>
  );
});

ErrorAnalysis.displayName = 'ErrorAnalysis';