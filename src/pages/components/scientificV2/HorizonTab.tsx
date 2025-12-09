import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useHorizonAnalysis } from '@/hooks/useScientificV2';
import type { HorizonAnalysisResponse, HorizonModelResult } from '@/types/scientificV2';

import { Base64Image, MetricCard, ModelSelector } from './shared';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d084d0'];

export const HorizonTab = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, execute } = useHorizonAnalysis();

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [maxHorizon, setMaxHorizon] = useState<number>(30);
  const [step, setStep] = useState<number>(1);
  const [includeSkillScores, setIncludeSkillScores] = useState(true);

  const handleRun = () => {
    if (selectedModels.length === 0) return;
    execute({
      model_ids: selectedModels,
      max_horizon: maxHorizon,
      step,
      include_skill_scores: includeSkillScores
    });
  };

  // Prepare MAE degradation chart data
  const maeChartData = useMemo(() => {
    if (!data?.model_results) return [];

    const horizons = Array.from({ length: Math.ceil(maxHorizon / step) }, (_, i) => (i + 1) * step);

    return horizons.map((horizon, idx) => {
      const point: Record<string, number | string> = { horizon };

      Object.entries(data.model_results).forEach(([modelId, result]) => {
        if ('error' in result) return;
        const modelResult = result as HorizonModelResult;
        if (modelResult.mae_by_horizon && modelResult.mae_by_horizon[idx] !== undefined) {
          point[modelId] = modelResult.mae_by_horizon[idx];
        }
      });

      return point;
    });
  }, [data, maxHorizon, step]);

  // Prepare RMSE chart data
  const rmseChartData = useMemo(() => {
    if (!data?.model_results) return [];

    const horizons = Array.from({ length: Math.ceil(maxHorizon / step) }, (_, i) => (i + 1) * step);

    return horizons.map((horizon, idx) => {
      const point: Record<string, number | string> = { horizon };

      Object.entries(data.model_results).forEach(([modelId, result]) => {
        if ('error' in result) return;
        const modelResult = result as HorizonModelResult;
        if (modelResult.rmse_by_horizon && modelResult.rmse_by_horizon[idx] !== undefined) {
          point[modelId] = modelResult.rmse_by_horizon[idx];
        }
      });

      return point;
    });
  }, [data, maxHorizon, step]);

  const getModelResult = (result: HorizonAnalysisResponse['model_results'][string]): HorizonModelResult | null => {
    if ('error' in result) return null;
    return result;
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('Аналіз горизонту прогнозування')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ModelSelector
              selectedModels={selectedModels}
              onChange={setSelectedModels}
              label={t('Виберіть моделі')}
              filterTypes={['ml', 'ensemble']}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Switch checked={includeSkillScores} onChange={(e) => setIncludeSkillScores(e.target.checked)} />
              <Typography>{t('Включити Skill Scores')}</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>
              {t('Максимальний горизонт')}: {maxHorizon} {t('днів')}
            </Typography>
            <Slider
              value={maxHorizon}
              onChange={(_, v) => setMaxHorizon(v as number)}
              min={7}
              max={90}
              marks={[
                { value: 7, label: '7' },
                { value: 30, label: '30' },
                { value: 60, label: '60' },
                { value: 90, label: '90' }
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>
              {t('Крок')}: {step}
            </Typography>
            <Slider
              value={step}
              onChange={(_, v) => setStep(v as number)}
              min={1}
              max={7}
              marks={[
                { value: 1, label: '1' },
                { value: 3, label: '3' },
                { value: 5, label: '5' },
                { value: 7, label: '7' }
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={selectedModels.length === 0 || isLoading}
              fullWidth
            >
              {t('Запустити аналіз')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {isLoading && <LoadingFallback />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {data && !isLoading && (
        <Stack spacing={3}>
          {/* Summary Cards */}
          <Grid container spacing={2}>
            {Object.entries(data.optimal_horizons).map(([modelId, optimalHorizon]) => {
              const degradationRate = data?.degradation_rates?.[modelId] ?? 0;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                  <MetricCard
                    title={`${modelId} - ${t('Оптимальний горизонт')}`}
                    value={`${optimalHorizon} ${t('днів')}`}
                    subtitle={`${t('Швидкість деградації')}: ${(degradationRate * 100).toFixed(2)}%/${t('день')}`}
                    color={degradationRate < 0.05 ? 'success' : degradationRate < 0.1 ? 'warning' : 'error'}
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* MAE Degradation Chart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Деградація MAE по горизонту')}
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={maeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="horizon"
                  label={{ value: t('Горизонт (днів)'), position: 'bottom' }}
                />
                <YAxis label={{ value: 'MAE', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {selectedModels.map((modelId, idx) => (
                  <Line
                    key={modelId}
                    type="monotone"
                    dataKey={modelId}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={modelId}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* RMSE Degradation Chart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Деградація RMSE по горизонту')}
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={rmseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="horizon"
                  label={{ value: t('Горизонт (днів)'), position: 'bottom' }}
                />
                <YAxis label={{ value: 'RMSE', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {selectedModels.map((modelId, idx) => (
                  <Line
                    key={modelId}
                    type="monotone"
                    dataKey={modelId}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    name={modelId}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Skill Scores */}
          {data.skill_scores && Object.keys(data.skill_scores).length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Skill Scores (vs Persistence)')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Модель')}</TableCell>
                      <TableCell align="right">{t('Skill Score')}</TableCell>
                      <TableCell align="right">{t('MSE моделі')}</TableCell>
                      <TableCell align="right">{t('MSE Persistence')}</TableCell>
                      <TableCell align="center">{t('Оцінка')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(data.skill_scores).map(([modelId, scores]) => (
                      <TableRow key={modelId}>
                        <TableCell>{modelId}</TableCell>
                        <TableCell align="right">
                          <Typography
                            fontWeight="bold"
                            color={scores.vs_persistence > 0 ? 'success.main' : 'error.main'}
                          >
                            {(scores.vs_persistence * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{scores.model_mse.toFixed(4)}</TableCell>
                        <TableCell align="right">{scores.persistence_mse.toFixed(4)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              scores.vs_persistence > 0.5
                                ? t('Відмінно')
                                : scores.vs_persistence > 0.2
                                  ? t('Добре')
                                  : scores.vs_persistence > 0
                                    ? t('Прийнятно')
                                    : t('Погано')
                            }
                            size="small"
                            color={
                              scores.vs_persistence > 0.5
                                ? 'success'
                                : scores.vs_persistence > 0.2
                                  ? 'info'
                                  : scores.vs_persistence > 0
                                    ? 'warning'
                                    : 'error'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Skill Score показує наскільки модель краща за просту персистентну модель (вчорашнє значення). Позитивний score означає покращення.')}
              </Typography>
            </Paper>
          )}

          {/* Detailed Metrics Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Детальні метрики по горизонту')}
            </Typography>
            {selectedModels.map((modelId) => {
              const modelResult = data?.model_results?.[modelId];
              const result = modelResult ? getModelResult(modelResult) : null;
              if (!result) {
                return (
                  <Alert key={modelId} severity="error" sx={{ mb: 2 }}>
                    {modelId}: {t('Помилка отримання даних')}
                  </Alert>
                );
              }

              return (
                <Box key={modelId} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {modelId}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Горизонт')}</TableCell>
                          <TableCell align="right">MAE</TableCell>
                          <TableCell align="right">RMSE</TableCell>
                          <TableCell align="right">R²</TableCell>
                          <TableCell align="right">MAPE</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.horizon_metrics.slice(0, 10).map((metrics) => (
                          <TableRow key={metrics.horizon}>
                            <TableCell>{metrics.horizon} {t('днів')}</TableCell>
                            <TableCell align="right">{metrics.mae.toFixed(4)}</TableCell>
                            <TableCell align="right">{metrics.rmse.toFixed(4)}</TableCell>
                            <TableCell align="right">{metrics.r2.toFixed(4)}</TableCell>
                            <TableCell align="right">{metrics.mape.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}
          </Paper>

          {/* Recommendations */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Рекомендації')}
            </Typography>
            <Stack spacing={1}>
              {Object.entries(data.recommendations).map(([modelId, recommendation]) => (
                <Card key={modelId} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle2" color="primary">
                      {modelId}
                    </Typography>
                    <Typography variant="body2">{recommendation}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>

          {/* Base64 Plot */}
          {data.plots?.degradation && (
            <Base64Image
              data={data.plots.degradation}
              alt="Degradation Plot"
              title={t('Графік деградації продуктивності')}
            />
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>{t('Інтерпретація')}:</strong>{' '}
              {t('Оптимальний горизонт - це максимальний горизонт, при якому якість прогнозу ще прийнятна. Швидкість деградації показує наскільки швидко погіршується точність.')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Виберіть моделі та запустіть аналіз для перегляду результатів')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
