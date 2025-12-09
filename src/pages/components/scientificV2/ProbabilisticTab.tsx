import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { useProbabilisticForecast } from '@/hooks/useScientificV2';
import type { ProbabilisticForecastResponse } from '@/types/scientificV2';

import { Base64Image, MetricCard, ModelSelector } from './shared';

export const ProbabilisticTab = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, execute } = useProbabilisticForecast();

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [horizon, setHorizon] = useState<number>(7);
  const [quantiles, setQuantiles] = useState<number[]>([0.1, 0.25, 0.5, 0.75, 0.9]);
  const [includeCrps, setIncludeCrps] = useState(true);
  const [selectedModelForChart, setSelectedModelForChart] = useState<string>('');

  const handleRun = () => {
    if (selectedModels.length === 0) return;
    execute({
      model_ids: selectedModels,
      forecast_horizon: horizon,
      quantiles,
      include_crps: includeCrps
    });
  };

  // Set first model as default for chart when data arrives
  const defaultModel = data && selectedModels.length > 0 && !selectedModelForChart ? selectedModels[0] : null;
  if (defaultModel && defaultModel !== selectedModelForChart) {
    setSelectedModelForChart(defaultModel);
  }

  // Prepare fan chart data
  const fanChartData = useMemo(() => {
    if (!data || !selectedModelForChart) return [];

    const modelResult = data.model_results[selectedModelForChart];
    if (!modelResult || 'error' in modelResult) return [];

    const quantileData = data.quantile_forecasts[selectedModelForChart];
    if (!quantileData) return [];

    return modelResult.point_forecast.map((value, index) => {
      const point: Record<string, number | string> = {
        day: modelResult.forecast_dates?.[index] || `${t('День')} ${index + 1}`,
        pointForecast: value
      };

      // Add quantiles
      Object.entries(quantileData).forEach(([q, values]) => {
        point[`q${q}`] = values[index] ?? 0;
      });

      // Calculate ranges for area charts
      if (quantileData['0.1'] && quantileData['0.9']) {
        point.range90 = (quantileData['0.9'][index] ?? 0) - (quantileData['0.1'][index] ?? 0);
        point.base90 = quantileData['0.1'][index] ?? 0;
      }
      if (quantileData['0.25'] && quantileData['0.75']) {
        point.range50 = (quantileData['0.75'][index] ?? 0) - (quantileData['0.25'][index] ?? 0);
        point.base50 = quantileData['0.25'][index] ?? 0;
      }

      return point;
    });
  }, [data, selectedModelForChart, t]);

  const getModelResult = (result: ProbabilisticForecastResponse['model_results'][string]) => {
    if ('error' in result) return null;
    return result;
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('Ймовірнісний прогноз')}
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
              <Switch checked={includeCrps} onChange={(e) => setIncludeCrps(e.target.checked)} />
              <Typography>{t('Включити CRPS метрики')}</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>
              {t('Горизонт прогнозу')}: {horizon} {t('днів')}
            </Typography>
            <Slider
              value={horizon}
              onChange={(_, v) => setHorizon(v as number)}
              min={1}
              max={30}
              marks={[
                { value: 1, label: '1' },
                { value: 7, label: '7' },
                { value: 14, label: '14' },
                { value: 30, label: '30' }
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('Квантилі')}</InputLabel>
              <Select
                multiple
                value={quantiles}
                onChange={(e) => setQuantiles(e.target.value as number[])}
                label={t('Квантилі')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map((q) => (
                      <Chip key={q} label={`${(q * 100).toFixed(0)}%`} size="small" />
                    ))}
                  </Box>
                )}
              >
                {[0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95].map((q) => (
                  <MenuItem key={q} value={q}>
                    {(q * 100).toFixed(0)}%
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={selectedModels.length === 0 || isLoading}
              fullWidth
            >
              {t('Запустити прогноз')}
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Горизонт')}
                value={`${data.metadata.forecast_horizon} ${t('днів')}`}
                subtitle={`${data.metadata.models_analyzed} ${t('моделей')}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Квантилі')}
                value={data.metadata.quantiles.length}
                subtitle={data.metadata.quantiles.map((q) => `${(q * 100).toFixed(0)}%`).join(', ')}
              />
            </Grid>
            {data.crps_scores && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    title={t('Найкращий CRPS')}
                    value={Object.entries(data.crps_scores).sort(([, a], [, b]) => a - b)[0]?.[0] || '-'}
                    subtitle={`CRPS: ${Object.entries(data.crps_scores).sort(([, a], [, b]) => a - b)[0]?.[1].toFixed(4) || '-'}`}
                    color="success"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    title={t('Середній CRPS')}
                    value={(Object.values(data.crps_scores).reduce((a, b) => a + b, 0) / Object.values(data.crps_scores).length).toFixed(4)}
                    subtitle={t('по всіх моделях')}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Model selector for chart */}
          {selectedModels.length > 1 && (
            <FormControl fullWidth>
              <InputLabel>{t('Модель для графіка')}</InputLabel>
              <Select
                value={selectedModelForChart}
                onChange={(e) => setSelectedModelForChart(e.target.value)}
                label={t('Модель для графіка')}
              >
                {selectedModels.map((modelId) => (
                  <MenuItem key={modelId} value={modelId}>
                    {modelId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Fan Chart */}
          {fanChartData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Fan Chart')} - {selectedModelForChart}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={fanChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* 90% interval */}
                  {fanChartData[0]?.range90 !== undefined && (
                    <Area
                      type="monotone"
                      dataKey="range90"
                      stackId="1"
                      stroke="none"
                      fill="#ef5350"
                      fillOpacity={0.2}
                      name={t('10-90% інтервал')}
                    />
                  )}

                  {/* 50% interval */}
                  {fanChartData[0]?.range50 !== undefined && (
                    <Area
                      type="monotone"
                      dataKey="range50"
                      stackId="2"
                      stroke="none"
                      fill="#2196f3"
                      fillOpacity={0.3}
                      name={t('25-75% інтервал')}
                    />
                  )}

                  {/* Median line */}
                  {fanChartData[0]?.['q0.5'] !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="q0.5"
                      stroke="#4caf50"
                      strokeWidth={2}
                      dot={false}
                      name={t('Медіана (50%)')}
                    />
                  )}

                  {/* Point forecast */}
                  <Line
                    type="monotone"
                    dataKey="pointForecast"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={t('Точковий прогноз')}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Fan Chart показує розподіл ймовірнісного прогнозу. Темніші області - більш ймовірні значення.')}
              </Typography>
            </Paper>
          )}

          {/* CRPS Scores */}
          {data.crps_scores && Object.keys(data.crps_scores).length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('CRPS (Continuous Ranked Probability Score)')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Модель')}</TableCell>
                      <TableCell align="right">CRPS</TableCell>
                      <TableCell align="center">{t('Ранк')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(data.crps_scores)
                      .sort(([, a], [, b]) => a - b)
                      .map(([modelId, crps], idx) => (
                        <TableRow key={modelId}>
                          <TableCell>{modelId}</TableCell>
                          <TableCell align="right">{crps.toFixed(4)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`#${idx + 1}`}
                              size="small"
                              color={idx === 0 ? 'success' : idx < 3 ? 'info' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('CRPS вимірює якість ймовірнісного прогнозу. Нижчі значення краще.')}
              </Typography>
            </Paper>
          )}

          {/* Pinball Losses */}
          {data.pinball_losses && Object.keys(data.pinball_losses).length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Pinball Loss по квантилях')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Модель')}</TableCell>
                      {quantiles.map((q) => (
                        <TableCell key={q} align="right">
                          {(q * 100).toFixed(0)}%
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(data.pinball_losses).map(([modelId, losses]) => (
                      <TableRow key={modelId}>
                        <TableCell>{modelId}</TableCell>
                        {quantiles.map((q) => (
                          <TableCell key={q} align="right">
                            {losses[String(q)]?.toFixed(4) || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Calibration Metrics */}
          {data.calibration_metrics && Object.keys(data.calibration_metrics).length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Калібрування квантилів')}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(data.calibration_metrics).map(([modelId, calibration]) => (
                  <Grid size={{ xs: 12, md: 6 }} key={modelId}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {modelId}
                        </Typography>
                        <Stack spacing={0.5}>
                          {Object.entries(calibration).map(([quantile, values]) => {
                            const diff = Math.abs(values.observed - values.expected) * 100;
                            return (
                              <Box key={quantile} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">{(parseFloat(quantile) * 100).toFixed(0)}%:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    {(values.observed * 100).toFixed(1)}% / {(values.expected * 100).toFixed(1)}%
                                  </Typography>
                                  <Chip
                                    label={`${diff.toFixed(1)}%`}
                                    size="small"
                                    color={diff < 5 ? 'success' : diff < 10 ? 'warning' : 'error'}
                                  />
                                </Box>
                              </Box>
                            );
                          })}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Калібрування показує відповідність реальних vs очікуваних частот для кожного квантиля.')}
              </Typography>
            </Paper>
          )}

          {/* Individual Model Metrics */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Метрики моделей')}
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(data.model_results).map(([modelId, result]) => {
                const modelResult = getModelResult(result);
                if (!modelResult) {
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                      <Alert severity="error">{modelId}: Error</Alert>
                    </Grid>
                  );
                }

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {modelId}
                        </Typography>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">MAE:</Typography>
                            <Typography variant="body2">{modelResult.metrics.mae.toFixed(4)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">RMSE:</Typography>
                            <Typography variant="body2">{modelResult.metrics.rmse.toFixed(4)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">R²:</Typography>
                            <Typography variant="body2">{modelResult.metrics.r2.toFixed(4)}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          {/* Base64 Plot */}
          {data.plots?.fan_chart && (
            <Base64Image data={data.plots.fan_chart} alt="Fan Chart" title={t('Fan Chart (всі моделі)')} />
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>CRPS</strong>: {t('Узагальнена метрика якості ймовірнісного прогнозу')} |{' '}
              <strong>Pinball Loss</strong>: {t('Якість прогнозу для конкретного квантиля')} |{' '}
              <strong>{t('Калібрування')}</strong>: {t('Наскільки ймовірності відповідають реальності')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Виберіть моделі та запустіть прогноз для перегляду результатів')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
