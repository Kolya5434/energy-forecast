import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Tooltip as MuiTooltip,
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
import { useEnsembleAnalysis } from '@/hooks/useScientificV2';
import { MetricCard, ModelSelector } from './shared';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d084d0'];

export const EnsembleTab = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, execute } = useEnsembleAnalysis();

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [testDays, setTestDays] = useState<number>(30);
  const [computeWeights, setComputeWeights] = useState(true);

  const handleRun = () => {
    if (selectedModels.length < 2) return;
    execute({
      model_ids: selectedModels,
      test_size_days: testDays,
      compute_optimal_weights: computeWeights
    });
  };

  // Prepare correlation matrix data for heatmap
  const correlationData = useMemo(() => {
    if (!data?.diversity_metrics.correlation_matrix) return [];
    const matrix = data.diversity_metrics.correlation_matrix;
    const models = Object.keys(matrix);

    return models.map((model1) => {
      const row: Record<string, number | string> = { model: model1 };
      models.forEach((model2) => {
        row[model2] = matrix[model1]?.[model2] ?? 0;
      });
      return row;
    });
  }, [data]);

  // Prepare performance comparison data
  const performanceData = useMemo(() => {
    if (!data?.individual_performance) return [];

    return Object.entries(data.individual_performance).map(([modelId, metrics]) => ({
      model: modelId,
      MAE: metrics.mae,
      RMSE: metrics.rmse,
      'R²': metrics.r2,
      MAPE: metrics.mape
    }));
  }, [data]);

  // Prepare weights data for pie/bar chart
  const weightsData = useMemo(() => {
    if (!data?.optimal_weights) return [];

    return Object.entries(data.optimal_weights).map(([modelId, weight]) => ({
      model: modelId,
      weight: weight * 100
    }));
  }, [data]);

  // Radar chart data for stability analysis
  const stabilityData = useMemo(() => {
    if (!data?.stability_analysis) return [];

    const { prediction_std, cv } = data.stability_analysis;
    return Object.keys(prediction_std).map((modelId) => ({
      model: modelId,
      std: prediction_std[modelId] ?? 0,
      cv: (cv?.[modelId] ?? 0) * 100
    }));
  }, [data]);

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <GroupWorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('Аналіз ансамблю моделей')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ModelSelector
              selectedModels={selectedModels}
              onChange={setSelectedModels}
              label={t('Виберіть моделі (мінімум 2)')}
              filterTypes={['ml', 'ensemble']}
              minSelection={2}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Switch checked={computeWeights} onChange={(e) => setComputeWeights(e.target.checked)} />
              <Typography>{t('Обчислити оптимальні ваги')}</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>
              {t('Тестовий період')}: {testDays} {t('днів')}
            </Typography>
            <Slider
              value={testDays}
              onChange={(_, v) => setTestDays(v as number)}
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

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={selectedModels.length < 2 || isLoading}
              fullWidth
            >
              {t('Запустити аналіз')}
            </Button>
            {selectedModels.length < 2 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('Виберіть принаймні 2 моделі для аналізу ансамблю')}
              </Alert>
            )}
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
          {/* Diversity Metrics Summary */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Середня кореляція')}
                value={data.diversity_metrics.average_correlation.toFixed(3)}
                subtitle={t('Чим нижче, тим краще')}
                color={data.diversity_metrics.average_correlation < 0.7 ? 'success' : 'warning'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Міра розбіжності')}
                value={data.diversity_metrics.disagreement_measure.toFixed(3)}
                subtitle={t('Чим вище, тим краще')}
                color={data.diversity_metrics.disagreement_measure > 0.3 ? 'success' : 'warning'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Моделей в ансамблі')}
                value={data.metadata.n_models}
                subtitle={`${data.metadata.data_points} ${t('точок даних')}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('MAE ансамблю')}
                value={data.ensemble_performance.mae.toFixed(4)}
                subtitle={`${t('Просте середнє')}: ${data.ensemble_performance.simple_average.mae.toFixed(4)}`}
                color={
                  data.ensemble_performance.mae < data.ensemble_performance.simple_average.mae ? 'success' : 'info'
                }
              />
            </Grid>
          </Grid>

          {/* Optimal Weights */}
          {weightsData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Оптимальні ваги моделей')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weightsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="model" width={120} />
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Bar dataKey="weight" name={t('Вага')}>
                        {weightsData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    {weightsData.map((item, index) => (
                      <Box key={item.model} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 1,
                            bgcolor: CHART_COLORS[index % CHART_COLORS.length]
                          }}
                        />
                        <Typography sx={{ flex: 1 }}>{item.model}</Typography>
                        <Chip label={`${item.weight.toFixed(1)}%`} size="small" />
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Performance Comparison */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Порівняння продуктивності')}
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="MAE" fill="#8884d8" />
                <Bar dataKey="RMSE" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Correlation Matrix */}
          {correlationData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Матриця кореляції прогнозів')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      {Object.keys(data.diversity_metrics.correlation_matrix).map((model) => (
                        <TableCell key={model} align="center">
                          <Typography
                            variant="caption"
                            sx={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                          >
                            {model}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {correlationData.map((row) => (
                      <TableRow key={row.model as string}>
                        <TableCell component="th" scope="row">
                          {row.model}
                        </TableCell>
                        {Object.keys(data.diversity_metrics.correlation_matrix).map((model) => {
                          const value = row[model] as number;
                          const intensity = Math.abs(value);
                          const color =
                            value === 1 ? '#e0e0e0' : value > 0.8 ? '#ef5350' : value > 0.5 ? '#ffb74d' : '#81c784';

                          return (
                            <MuiTooltip key={model} title={value.toFixed(4)}>
                              <TableCell
                                align="center"
                                sx={{
                                  bgcolor: color,
                                  color: intensity > 0.6 ? 'white' : 'inherit',
                                  fontWeight: intensity > 0.8 ? 'bold' : 'normal'
                                }}
                              >
                                {value.toFixed(2)}
                              </TableCell>
                            </MuiTooltip>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t(
                  'Зелений = низька кореляція (добре для ансамблю), Червоний = висока кореляція (погано для ансамблю)'
                )}
              </Typography>
            </Paper>
          )}

          {/* Stability Analysis */}
          {stabilityData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Аналіз стабільності')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={stabilityData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="model" />
                      <PolarRadiusAxis />
                      <Radar name="CV (%)" dataKey="cv" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Модель')}</TableCell>
                          <TableCell align="right">{t('Стд. відхилення')}</TableCell>
                          <TableCell align="right">{t('CV (%)')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stabilityData.map((item) => (
                          <TableRow key={item.model}>
                            <TableCell>{item.model}</TableCell>
                            <TableCell align="right">{item.std.toFixed(4)}</TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${item.cv.toFixed(1)}%`}
                                size="small"
                                color={item.cv < 10 ? 'success' : item.cv < 20 ? 'warning' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Q-Statistics */}
          {Object.keys(data.diversity_metrics.q_statistics).length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Q-статистика (попарна)')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {Object.entries(data.diversity_metrics.q_statistics).map(([pair, value]) => (
                  <Chip
                    key={pair}
                    label={`${pair.replace('_vs_', ' vs ')}: ${value.toFixed(3)}`}
                    size="small"
                    color={value < 0.5 ? 'success' : value < 0.8 ? 'warning' : 'error'}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('Q < 0.5 вказує на хорошу різноманітність між моделями')}
              </Typography>
            </Paper>
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>{t('Інтерпретація')}:</strong>{' '}
              {t(
                'Низька кореляція та висока різноманітність між моделями покращують якість ансамблю. Оптимальні ваги показують внесок кожної моделі.'
              )}
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
