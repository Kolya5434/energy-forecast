import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useBenchmark, useScalabilityTest } from '@/hooks/useScientificV2';
import { Base64Image, MetricCard, ModelSelector } from './shared';

export const BenchmarkTab = memo(function BenchmarkTab() {
  const { t } = useTranslation();
  const benchmark = useBenchmark();
  const scalabilityTest = useScalabilityTest();

  const [selectedModelForScalability, setSelectedModelForScalability] = useState<string>('');

  // Load benchmark data on mount
  useEffect(() => {
    benchmark.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScalabilityTest = () => {
    if (!selectedModelForScalability) return;
    scalabilityTest.execute({
      model_id: selectedModelForScalability
    });
  };

  // Prepare Pareto frontier chart data
  const paretoData = useMemo(() => {
    if (!benchmark.data?.pareto_frontier) return [];

    return benchmark.data.pareto_frontier.map((item) => ({
      ...item,
      name: item.model_id
    }));
  }, [benchmark.data]);

  // Prepare inference times comparison data
  const inferenceData = useMemo(() => {
    if (!benchmark.data?.inference_times) return [];

    return Object.entries(benchmark.data.inference_times).map(([modelId, times]) => ({
      model: modelId,
      avg: times.avg_ms,
      h1: times.horizon_1,
      h7: times.horizon_7,
      h30: times.horizon_30
    }));
  }, [benchmark.data]);

  // Prepare scalability chart data
  const scalabilityData = useMemo(() => {
    if (!scalabilityTest.data) return [];

    const sizes = Object.keys(scalabilityTest.data.inference_times)
      .map(Number)
      .sort((a, b) => a - b);

    return sizes.map((size) => ({
      size,
      inference: scalabilityTest.data!.inference_times[size],
      training: scalabilityTest.data!.training_times[size],
      memory: scalabilityTest.data!.memory_usage[size]
    }));
  }, [scalabilityTest.data]);

  return (
    <Box>
      {/* Benchmark Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('Бенчмарк моделей')}
          </Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => benchmark.execute()} disabled={benchmark.isLoading}>
            {t('Оновити')}
          </Button>
        </Box>

        {benchmark.isLoading && <LoadingFallback />}
        {benchmark.error && <Alert severity="error">{benchmark.error}</Alert>}
      </Paper>

      {/* Benchmark Results */}
      {benchmark.data && !benchmark.isLoading && (
        <Stack spacing={3}>
          {/* Summary Cards */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Моделей протестовано')}
                value={benchmark.data.metadata.n_models}
                subtitle={t('в бенчмарку')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Pareto-оптимальних')}
                value={benchmark.data.pareto_frontier.filter((m) => m.is_pareto_optimal).length}
                icon={<StarIcon />}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Найшвидша модель')}
                value={
                  Object.entries(benchmark.data.inference_times).sort(([, a], [, b]) => a.avg_ms - b.avg_ms)[0]?.[0] ||
                  '-'
                }
                subtitle={`${
                  Object.entries(benchmark.data.inference_times)
                    .sort(([, a], [, b]) => a.avg_ms - b.avg_ms)[0]?.[1]
                    .avg_ms.toFixed(1) || '-'
                } ms`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Найточніша модель')}
                value={benchmark.data.pareto_frontier.sort((a, b) => a.mae - b.mae)[0]?.model_id || '-'}
                subtitle={`MAE: ${benchmark.data.pareto_frontier.sort((a, b) => a.mae - b.mae)[0]?.mae.toFixed(4) || '-'}`}
              />
            </Grid>
          </Grid>

          {/* Pareto Frontier Chart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Pareto Frontier (Час vs Точність)')}
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="inference_time_ms"
                  name={t('Час (ms)')}
                  label={{ value: t('Час інференсу (ms)'), position: 'bottom' }}
                />
                <YAxis
                  type="number"
                  dataKey="mae"
                  name="MAE"
                  label={{ value: 'MAE', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="category" dataKey="model_id" name={t('Модель')} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toFixed(4) : String(value ?? ''),
                    name
                  ]}
                />
                <Legend />
                <Scatter
                  name={t('Pareto-оптимальні')}
                  data={paretoData.filter((d) => d.is_pareto_optimal)}
                  fill="#82ca9d"
                  shape="star"
                />
                <Scatter name={t('Інші моделі')} data={paretoData.filter((d) => !d.is_pareto_optimal)} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('Pareto-оптимальні моделі (зірки) пропонують найкращий компроміс між швидкістю та точністю.')}
            </Typography>
          </Paper>

          {/* Inference Times Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Час інференсу по горизонтах')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Модель')}</TableCell>
                    <TableCell align="right">{t('Середній (ms)')}</TableCell>
                    <TableCell align="right">H=1</TableCell>
                    <TableCell align="right">H=7</TableCell>
                    <TableCell align="right">H=30</TableCell>
                    <TableCell align="center">{t('Складність')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inferenceData.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell>{row.model}</TableCell>
                      <TableCell align="right">{row.avg.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.h1.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.h7.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.h30.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={benchmark.data?.scalability[row.model]?.complexity || '-'}
                          size="small"
                          color={
                            benchmark.data?.scalability[row.model]?.complexity === 'O(n)'
                              ? 'success'
                              : benchmark.data?.scalability[row.model]?.complexity === 'O(n log n)'
                                ? 'info'
                                : 'warning'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Scalability Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Масштабованість')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Модель')}</TableCell>
                    <TableCell align="right">100 samples</TableCell>
                    <TableCell align="right">1000 samples</TableCell>
                    <TableCell align="right">10000 samples</TableCell>
                    <TableCell align="center">{t('Складність')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(benchmark.data.scalability).map(([modelId, data]) => (
                    <TableRow key={modelId}>
                      <TableCell>{modelId}</TableCell>
                      <TableCell align="right">{data['100_samples'].toFixed(2)} ms</TableCell>
                      <TableCell align="right">{data['1000_samples'].toFixed(2)} ms</TableCell>
                      <TableCell align="right">{data['10000_samples'].toFixed(2)} ms</TableCell>
                      <TableCell align="center">
                        <Chip label={data.complexity} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Recommendations */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Рекомендації')}
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(benchmark.data.recommendations).map(([modelId, recommendation]) => (
                <Grid size={{ xs: 12, md: 6 }} key={modelId}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="subtitle2" color="primary">
                        {modelId}
                      </Typography>
                      <Typography variant="body2">{recommendation}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Base64 Plot */}
          {benchmark.data.plots?.pareto && (
            <Base64Image data={benchmark.data.plots.pareto} alt="Pareto Plot" title={t('Pareto Frontier Plot')} />
          )}
        </Stack>
      )}

      {/* Detailed Scalability Test */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Детальний тест масштабованості')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ModelSelector
              selectedModels={selectedModelForScalability ? [selectedModelForScalability] : []}
              onChange={(models) => setSelectedModelForScalability(models[0] || '')}
              multiple={false}
              label={t('Виберіть модель')}
              filterTypes={['ml', 'ensemble']}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleScalabilityTest}
              disabled={!selectedModelForScalability || scalabilityTest.isLoading}
              fullWidth
              sx={{ height: '56px' }}
            >
              {t('Запустити тест')}
            </Button>
          </Grid>
        </Grid>

        {/* Scalability Test Loading */}
        {scalabilityTest.isLoading && <LoadingFallback />}

        {/* Scalability Test Error */}
        {scalabilityTest.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {scalabilityTest.error}
          </Alert>
        )}

        {/* Scalability Test Results */}
        {scalabilityTest.data && !scalabilityTest.isLoading && (
          <Stack spacing={3} sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Chip label={`${t('Модель')}: ${scalabilityTest.data.model_id}`} color="primary" />
                  <Chip label={`${t('Складність')}: ${scalabilityTest.data.complexity_estimate}`} />
                  <Chip label={`${t('Розміри')}: ${scalabilityTest.data.metadata.data_sizes_tested.join(', ')}`} />
                </Stack>
              </CardContent>
            </Card>

            {/* Scalability Charts */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('Час інференсу vs Розмір даних')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={scalabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="size" label={{ value: t('Кількість семплів'), position: 'bottom' }} />
                      <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="inference" stroke="#8884d8" name={t('Інференс')} />
                      <Line type="monotone" dataKey="training" stroke="#82ca9d" name={t('Тренування')} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t("Використання пам'яті vs Розмір даних")}
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={scalabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="size" label={{ value: t('Кількість семплів'), position: 'bottom' }} />
                      <YAxis label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="memory" stroke="#ffc658" name={t("Пам'ять (MB)")} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Base64 Plot */}
            {scalabilityTest.data.plots?.scalability && (
              <Base64Image
                data={scalabilityTest.data.plots.scalability}
                alt="Scalability Plot"
                title={t('Графік масштабованості')}
              />
            )}
          </Stack>
        )}
      </Paper>

      {/* Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>{t('Pareto Frontier')}</strong>:{' '}
          {t('Моделі, що пропонують найкращий компроміс між швидкістю та точністю')} |{' '}
          <strong>{t('Складність')}</strong>: O(n) - {t('лінійна')}, O(n²) - {t('квадратична')}
        </Typography>
      </Alert>
    </Box>
  );
});
