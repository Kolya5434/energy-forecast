import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useUncertainty } from '@/hooks/useScientificV2';
import type { UncertaintyResponse } from '@/types/scientificV2';
import { ModelSelector } from './shared';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d084d0'];

export const UncertaintyTab = memo(function UncertaintyTab() {
  const { t } = useTranslation();
  const { data, isLoading, error, execute } = useUncertainty();

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [horizon, setHorizon] = useState<number>(7);
  const [method, setMethod] = useState<'bootstrap' | 'conformal' | 'bayesian'>('bootstrap');
  const [confidenceLevels, setConfidenceLevels] = useState<number[]>([0.9, 0.95]);
  const [nBootstrap, setNBootstrap] = useState<number>(100);
  const [selectedModelForChart, setSelectedModelForChart] = useState<string>('');

  const handleRun = () => {
    if (selectedModels.length === 0) return;
    execute({
      model_ids: selectedModels,
      forecast_horizon: horizon,
      method,
      confidence_levels: confidenceLevels,
      n_bootstrap: nBootstrap
    });
  };

  // Set first model as default for chart when data arrives
  const defaultModel = data && selectedModels.length > 0 && !selectedModelForChart ? selectedModels[0] : null;
  if (defaultModel && defaultModel !== selectedModelForChart) {
    setSelectedModelForChart(defaultModel);
  }

  const chartData = useMemo(() => {
    if (!data || !selectedModelForChart) return [];

    const modelResult = data.model_results[selectedModelForChart];
    if (!modelResult || 'error' in modelResult) return [];

    const intervals = data.prediction_intervals[selectedModelForChart];
    if (!intervals) return [];

    return modelResult.point_forecast.map((value, index) => {
      const point: Record<string, number | string> = {
        day: `${t('День')} ${index + 1}`,
        forecast: value
      };

      // Add intervals
      Object.entries(intervals).forEach(([level, bounds]) => {
        point[`lower_${level}`] = bounds.lower[index] ?? 0;
        point[`upper_${level}`] = bounds.upper[index] ?? 0;
        point[`range_${level}`] = (bounds.upper[index] ?? 0) - (bounds.lower[index] ?? 0);
      });

      return point;
    });
  }, [data, selectedModelForChart, t]);

  const getModelMetrics = (result: UncertaintyResponse['model_results'][string]) => {
    if ('error' in result) return null;
    return result.metrics;
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Налаштування аналізу невизначеності')}
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
            <FormControl fullWidth>
              <InputLabel>{t('Метод')}</InputLabel>
              <Select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} label={t('Метод')}>
                <MenuItem value="bootstrap">Bootstrap</MenuItem>
                <MenuItem value="conformal">Conformal Prediction</MenuItem>
                <MenuItem value="bayesian">Bayesian</MenuItem>
              </Select>
            </FormControl>
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
            <Typography gutterBottom>
              {t('Кількість bootstrap ітерацій')}: {nBootstrap}
            </Typography>
            <Slider
              value={nBootstrap}
              onChange={(_, v) => setNBootstrap(v as number)}
              min={10}
              max={500}
              step={10}
              marks={[
                { value: 10, label: '10' },
                { value: 100, label: '100' },
                { value: 250, label: '250' },
                { value: 500, label: '500' }
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography gutterBottom>{t('Рівні довіри')}</Typography>
            <ToggleButtonGroup
              value={confidenceLevels}
              onChange={(_, newLevels) => newLevels.length > 0 && setConfidenceLevels(newLevels)}
              size="small"
            >
              <ToggleButton value={0.8}>80%</ToggleButton>
              <ToggleButton value={0.9}>90%</ToggleButton>
              <ToggleButton value={0.95}>95%</ToggleButton>
              <ToggleButton value={0.99}>99%</ToggleButton>
            </ToggleButtonGroup>
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
          {/* Metadata */}
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Chip label={`${t('Метод')}: ${data.metadata.method}`} color="primary" />
                <Chip label={`${t('Горизонт')}: ${data.metadata.forecast_horizon} ${t('днів')}`} />
                <Chip label={`Bootstrap: ${data.metadata.n_bootstrap}`} />
                <Chip
                  label={`${t('Рівні')}: ${data.metadata.confidence_levels.map((l) => `${l * 100}%`).join(', ')}`}
                />
              </Stack>
            </CardContent>
          </Card>

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

          {/* Chart */}
          {chartData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Прогноз з інтервалами невизначеності')} - {selectedModelForChart}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* Render areas for each confidence level */}
                  {confidenceLevels
                    .sort((a, b) => b - a)
                    .map((level, idx) => {
                      const levelKey = `${Math.round(level * 100)}%`;
                      return (
                        <Area
                          key={levelKey}
                          type="monotone"
                          dataKey={`range_${levelKey}`}
                          name={`${levelKey} ${t('інтервал')}`}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          fillOpacity={0.2}
                          stroke="none"
                        />
                      );
                    })}

                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name={t('Прогноз')}
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Metrics Grid */}
          <Typography variant="h6">{t('Метрики моделей')}</Typography>
          <Grid container spacing={2}>
            {Object.entries(data.model_results).map(([modelId, result]) => {
              const metrics = getModelMetrics(result);
              if (!metrics) {
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                    <Alert severity="error">
                      {modelId}: {'error' in result ? result.error : 'Error'}
                    </Alert>
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
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            MAE:
                          </Typography>
                          <Typography variant="body2">{metrics.mae.toFixed(4)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            RMSE:
                          </Typography>
                          <Typography variant="body2">{metrics.rmse.toFixed(4)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            R²:
                          </Typography>
                          <Typography variant="body2">{metrics.r2.toFixed(4)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            MAPE:
                          </Typography>
                          <Typography variant="body2">{metrics.mape.toFixed(2)}%</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Calibration Metrics */}
          {Object.keys(data.calibration_metrics).length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Метрики калібрування')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Модель/Рівень')}</TableCell>
                      <TableCell align="right">{t('Покриття')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(data.calibration_metrics).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key.replace(/_/g, ' ')}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${(value * 100).toFixed(1)}%`}
                            size="small"
                            color={value >= 0.9 ? 'success' : value >= 0.8 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>{t('Інтерпретація')}:</strong>{' '}
              {t(
                'Інтервали показують діапазон можливих значень прогнозу. Чим ширший інтервал, тим більша невизначеність.'
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
});
