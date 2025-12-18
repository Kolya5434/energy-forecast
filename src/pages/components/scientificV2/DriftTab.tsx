import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
  Typography
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useDriftAnalysis, useDriftStatus } from '@/hooks/useScientificV2';
import type { DriftStatusResponse } from '@/types/scientificV2';
import { MetricCard, ModelSelector } from './shared';

const getStatusIcon = (status: 'ok' | 'warning' | 'info' | 'critical') => {
  switch (status) {
    case 'ok':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningAmberIcon color="warning" />;
    case 'critical':
      return <ErrorOutlineIcon color="error" />;
    default:
      return <CheckCircleIcon color="info" />;
  }
};

const getStatusColor = (status: 'ok' | 'warning' | 'info' | 'critical'): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'ok':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'error';
    default:
      return 'info';
  }
};

export const DriftTab = memo(function DriftTab() {
  const { t } = useTranslation();
  const driftStatus = useDriftStatus();
  const driftAnalysis = useDriftAnalysis();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [windowSize, setWindowSize] = useState<number>(30);
  const [method, setMethod] = useState<'adwin' | 'ddm' | 'page_hinkley'>('adwin');
  const [sensitivity, setSensitivity] = useState<number>(0.01);

  // Load drift status on mount
  useEffect(() => {
    driftStatus.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDetailedAnalysis = () => {
    if (!selectedModel) return;
    driftAnalysis.execute({
      model_id: selectedModel,
      window_size: windowSize,
      method,
      sensitivity
    });
  };

  // Prepare performance over time chart data
  const performanceChartData = useMemo(() => {
    if (!driftAnalysis.data?.performance_over_time.windows) return [];

    return driftAnalysis.data.performance_over_time.windows.map((window, index) => ({
      window: index + 1,
      date: window.start_date || `Window ${index + 1}`,
      mae: window.mae,
      rmse: window.rmse,
      r2: window.r2
    }));
  }, [driftAnalysis.data]);

  // Prepare drift points for visualization
  const driftPointsData = useMemo(() => {
    if (!driftAnalysis.data?.drift_points) return [];

    return driftAnalysis.data.drift_points.map((point) => ({
      index: point.index,
      severity: point.severity,
      timestamp: point.timestamp || `Point ${point.index}`,
      meanBefore: point.mean_before,
      meanAfter: point.mean_after
    }));
  }, [driftAnalysis.data]);

  const getModelStatusFromResponse = (modelData: DriftStatusResponse['models'][string]) => {
    if ('error' in modelData) return null;
    return modelData;
  };

  return (
    <Box>
      {/* Quick Status Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('Швидкий огляд дрейфу моделей')}</Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => driftStatus.execute()} disabled={driftStatus.isLoading}>
            {t('Оновити')}
          </Button>
        </Box>

        {driftStatus.isLoading && <LoadingFallback />}
        {driftStatus.error && <Alert severity="error">{driftStatus.error}</Alert>}

        {driftStatus.data && !driftStatus.isLoading && (
          <Grid container spacing={2}>
            {Object.entries(driftStatus.data.models).map(([modelId, modelData]) => {
              const status = getModelStatusFromResponse(modelData);
              if (!status) {
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                    <Alert severity="error">{modelId}: Error</Alert>
                  </Grid>
                );
              }

              const changeIcon = status.change_percent > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />;
              const changeColor = status.drift_detected ? 'error' : status.change_percent > 10 ? 'warning' : 'success';

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedModel === modelId ? 2 : 1,
                      borderColor: selectedModel === modelId ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedModel(modelId)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {modelId}
                        </Typography>
                        {getStatusIcon(status.status)}
                      </Box>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Поточний MAE')}:
                          </Typography>
                          <Typography variant="body2">{status.current_mae.toFixed(4)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Попередній MAE')}:
                          </Typography>
                          <Typography variant="body2">{status.previous_mae.toFixed(4)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={changeIcon}
                            label={`${status.change_percent > 0 ? '+' : ''}${status.change_percent.toFixed(1)}%`}
                            size="small"
                            color={changeColor}
                          />
                          {status.drift_detected && (
                            <Chip label={t('Дрейф виявлено')} size="small" color="error" variant="outlined" />
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      {/* Detailed Analysis Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Детальний аналіз дрейфу')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ModelSelector
              selectedModels={selectedModel ? [selectedModel] : []}
              onChange={(models) => setSelectedModel(models[0] || '')}
              multiple={false}
              label={t('Виберіть модель для аналізу')}
              filterTypes={['ml', 'ensemble']}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('Метод виявлення')}</InputLabel>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as typeof method)}
                label={t('Метод виявлення')}
              >
                <MenuItem value="adwin">ADWIN</MenuItem>
                <MenuItem value="ddm">DDM (Drift Detection Method)</MenuItem>
                <MenuItem value="page_hinkley">Page-Hinkley</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>
              {t('Розмір вікна')}: {windowSize} {t('днів')}
            </Typography>
            <Slider
              value={windowSize}
              onChange={(_, v) => setWindowSize(v as number)}
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
              {t('Чутливість')}: {sensitivity}
            </Typography>
            <Slider
              value={sensitivity}
              onChange={(_, v) => setSensitivity(v as number)}
              min={0.001}
              max={0.1}
              step={0.001}
              marks={[
                { value: 0.001, label: '0.001' },
                { value: 0.01, label: '0.01' },
                { value: 0.05, label: '0.05' },
                { value: 0.1, label: '0.1' }
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              onClick={handleDetailedAnalysis}
              disabled={!selectedModel || driftAnalysis.isLoading}
              fullWidth
            >
              {t('Запустити детальний аналіз')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Analysis Loading */}
      {driftAnalysis.isLoading && <LoadingFallback />}

      {/* Detailed Analysis Error */}
      {driftAnalysis.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {driftAnalysis.error}
        </Alert>
      )}

      {/* Detailed Analysis Results */}
      {driftAnalysis.data && !driftAnalysis.isLoading && (
        <Stack spacing={3}>
          {/* Summary */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Статус')}
                value={driftAnalysis.data.alert_status.toUpperCase()}
                icon={getStatusIcon(driftAnalysis.data.alert_status)}
                color={getStatusColor(driftAnalysis.data.alert_status)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Дрейф виявлено')}
                value={driftAnalysis.data.drift_detected ? t('Так') : t('Ні')}
                color={driftAnalysis.data.drift_detected ? 'error' : 'success'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Точок дрейфу')}
                value={driftAnalysis.data.drift_points.length}
                subtitle={`${driftAnalysis.data.metadata.data_points_analyzed} ${t('точок проаналізовано')}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Тренд')}
                value={
                  driftAnalysis.data.performance_over_time.overall_trend === 'degrading'
                    ? t('Погіршення')
                    : t('Стабільний')
                }
                icon={
                  driftAnalysis.data.performance_over_time.overall_trend === 'degrading' ? (
                    <TrendingUpIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                color={driftAnalysis.data.performance_over_time.overall_trend === 'degrading' ? 'warning' : 'success'}
              />
            </Grid>
          </Grid>

          {/* Performance Over Time Chart */}
          {performanceChartData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Продуктивність в часі')}
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="window" label={{ value: t('Вікно'), position: 'bottom' }} />
                  <YAxis yAxisId="left" label={{ value: 'MAE/RMSE', angle: -90, position: 'insideLeft' }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'R²', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="mae"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    stroke="#8884d8"
                    name="MAE"
                  />
                  <Line yAxisId="left" type="monotone" dataKey="rmse" stroke="#82ca9d" strokeWidth={2} name="RMSE" />
                  <Line yAxisId="right" type="monotone" dataKey="r2" stroke="#ffc658" strokeWidth={2} name="R²" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Drift Points Visualization */}
          {driftPointsData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Виявлені точки дрейфу')}
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={driftPointsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="#666" />
                  <Scatter dataKey="severity" fill="#ef5350" name={t('Серйозність')} />
                </ComposedChart>
              </ResponsiveContainer>
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Індекс')}</TableCell>
                      <TableCell>{t('Час')}</TableCell>
                      <TableCell align="right">{t('Серйозність')}</TableCell>
                      <TableCell align="right">{t('Середнє до')}</TableCell>
                      <TableCell align="right">{t('Середнє після')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driftPointsData.slice(0, 10).map((point, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{point.index}</TableCell>
                        <TableCell>{point.timestamp}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={point.severity.toFixed(3)}
                            size="small"
                            color={point.severity > 0.5 ? 'error' : point.severity > 0.2 ? 'warning' : 'info'}
                          />
                        </TableCell>
                        <TableCell align="right">{point.meanBefore?.toFixed(4) || '-'}</TableCell>
                        <TableCell align="right">{point.meanAfter?.toFixed(4) || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Recommendations */}
          {driftAnalysis.data.recommendations.length > 0 && (
            <Alert severity={driftAnalysis.data.drift_detected ? 'warning' : 'info'}>
              <Typography variant="subtitle2" gutterBottom>
                {t('Рекомендації')}:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {driftAnalysis.data.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{rec}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Method Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>
                {t('Метод')}: {driftAnalysis.data.metadata.method}
              </strong>{' '}
              | {t('Розмір вікна')}: {driftAnalysis.data.metadata.window_size} | {t('Чутливість')}:{' '}
              {driftAnalysis.data.metadata.sensitivity}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!driftAnalysis.data && !driftAnalysis.isLoading && !driftAnalysis.error && selectedModel && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Натисніть "Запустити детальний аналіз" для перегляду результатів')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
});
