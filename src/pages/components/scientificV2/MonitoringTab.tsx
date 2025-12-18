import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RefreshIcon from '@mui/icons-material/Refresh';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import WarningIcon from '@mui/icons-material/Warning';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
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
import { useLiveMetrics, useMetricsStream } from '@/hooks/useScientificV2';
import { MetricCard } from './shared';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d084d0'];

const getAlertIcon = (severity: 'info' | 'warning' | 'critical') => {
  switch (severity) {
    case 'critical':
      return <ErrorIcon color="error" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    default:
      return <CheckCircleIcon color="info" />;
  }
};

const getAlertColor = (severity: 'info' | 'warning' | 'critical'): 'info' | 'warning' | 'error' => {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
};

export const MonitoringTab = memo(function MonitoringTab() {
  const { t } = useTranslation();
  const liveMetrics = useLiveMetrics();
  const [wsEnabled, setWsEnabled] = useState(false);
  const metricsStream = useMetricsStream(wsEnabled);

  const [metricsHistory, setMetricsHistory] = useState<Array<{ timestamp: string; [key: string]: number | string }>>(
    []
  );

  // Load initial metrics
  useEffect(() => {
    liveMetrics.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh every 30 seconds if WS not enabled
  useEffect(() => {
    const interval = setInterval(() => {
      if (!wsEnabled) {
        liveMetrics.execute();
      }
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsEnabled]);

  // Handle WebSocket messages
  useEffect(() => {
    if (metricsStream.metrics) {
      setMetricsHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            timestamp: new Date(metricsStream.metrics!.timestamp).toLocaleTimeString(),
            ...Object.fromEntries(
              Object.entries(metricsStream.metrics!.metrics).flatMap(([modelId, m]) => [
                [`${modelId}_mae`, m.mae],
                [`${modelId}_rmse`, m.rmse]
              ])
            )
          }
        ];
        // Keep only last 50 entries
        return newHistory.slice(-50);
      });
    }
  }, [metricsStream.metrics]);

  // Prepare rolling metrics chart data
  const rollingChartData = useMemo(() => {
    if (!liveMetrics.data?.rolling_metrics) return [];

    const firstModel = Object.keys(liveMetrics.data.rolling_metrics)[0];
    if (!firstModel) return [];

    const firstModelMetrics = liveMetrics.data.rolling_metrics[firstModel];
    const length = firstModelMetrics?.mae?.length ?? 0;

    return Array.from({ length }, (_, idx) => {
      const point: Record<string, number | string> = { index: idx + 1 };

      Object.entries(liveMetrics.data!.rolling_metrics).forEach(([modelId, metrics]) => {
        point[`${modelId}_mae`] = metrics.mae[idx] || 0;
        point[`${modelId}_rmse`] = metrics.rmse[idx] || 0;
      });

      return point;
    });
  }, [liveMetrics.data]);

  // Get unique models from data
  const modelIds = useMemo(() => {
    if (!liveMetrics.data?.current_metrics) return [];
    return Object.keys(liveMetrics.data.current_metrics);
  }, [liveMetrics.data]);

  return (
    <Box>
      {/* Header Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MonitorHeartIcon color="primary" />
            <Typography variant="h6">{t('Моніторинг в реальному часі')}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch checked={wsEnabled} onChange={(e) => setWsEnabled(e.target.checked)} />
              <Typography variant="body2">WebSocket</Typography>
              {wsEnabled ? (
                metricsStream.isConnected ? (
                  <Chip icon={<WifiIcon />} label={t('Підключено')} color="success" size="small" />
                ) : (
                  <Chip icon={<WifiOffIcon />} label={t("З'єднання...")} color="warning" size="small" />
                )
              ) : (
                <Chip label={t('Вимкнено')} size="small" variant="outlined" />
              )}
            </Box>

            <Button startIcon={<RefreshIcon />} onClick={() => liveMetrics.execute()} disabled={liveMetrics.isLoading}>
              {t('Оновити')}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Loading */}
      {liveMetrics.isLoading && !liveMetrics.data && <LoadingFallback />}

      {/* Error */}
      {liveMetrics.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {liveMetrics.error}
        </Alert>
      )}

      {/* WebSocket Error */}
      {metricsStream.error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          WebSocket: {metricsStream.error}
        </Alert>
      )}

      {/* Results */}
      {liveMetrics.data && (
        <Stack spacing={3}>
          {/* System Health */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Моделей завантажено')}
                value={liveMetrics.data.system_health.models_loaded}
                icon={<SignalCellularAltIcon />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Статус API')}
                value={liveMetrics.data.system_health.api_status}
                color={liveMetrics.data.system_health.api_status === 'ok' ? 'success' : 'error'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Кеш')}
                value={liveMetrics.data.system_health.cache_status}
                color={liveMetrics.data.system_health.cache_status === 'active' ? 'success' : 'warning'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title={t('Дані доступні')}
                value={liveMetrics.data.system_health.data_available ? t('Так') : t('Ні')}
                color={liveMetrics.data.system_health.data_available ? 'success' : 'error'}
              />
            </Grid>
          </Grid>

          {/* Current Metrics Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Поточні метрики моделей')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Модель')}</TableCell>
                    <TableCell align="right">MAE</TableCell>
                    <TableCell align="right">RMSE</TableCell>
                    <TableCell align="right">R²</TableCell>
                    <TableCell align="right">MAPE</TableCell>
                    <TableCell align="center">{t('Статус')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(liveMetrics.data.current_metrics).map(([modelId, metrics]) => (
                    <TableRow key={modelId}>
                      <TableCell>{modelId}</TableCell>
                      <TableCell align="right">{metrics.mae.toFixed(4)}</TableCell>
                      <TableCell align="right">{metrics.rmse.toFixed(4)}</TableCell>
                      <TableCell align="right">{metrics.r2.toFixed(4)}</TableCell>
                      <TableCell align="right">{metrics.mape.toFixed(2)}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={
                            metrics.r2 > 0.8 ? t('Добре') : metrics.r2 > 0.5 ? t('Прийнятно') : t('Потребує уваги')
                          }
                          size="small"
                          color={metrics.r2 > 0.8 ? 'success' : metrics.r2 > 0.5 ? 'warning' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('Останнє оновлення')}: {new Date(liveMetrics.data.last_updated).toLocaleString()}
            </Typography>
          </Paper>

          {/* Rolling Metrics Chart */}
          {rollingChartData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Історія MAE (Rolling Window)')}
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rollingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" label={{ value: t('Вікно'), position: 'bottom' }} />
                  <YAxis label={{ value: 'MAE', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {modelIds.map((modelId, idx) => (
                    <Line
                      key={modelId}
                      type="monotone"
                      dataKey={`${modelId}_mae`}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={`${modelId} MAE`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* WebSocket Real-time Chart */}
          {wsEnabled && metricsHistory.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">{t('Real-time Metrics')}</Typography>
                {metricsStream.isConnected && <Chip icon={<WifiIcon />} label="LIVE" color="success" size="small" />}
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {modelIds.slice(0, 4).map((modelId, idx) => (
                    <Line
                      key={modelId}
                      type="monotone"
                      dataKey={`${modelId}_mae`}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={`${modelId} MAE`}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Alerts */}
          {liveMetrics.data.alerts.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Сповіщення')}
              </Typography>
              <Stack spacing={1}>
                {liveMetrics.data.alerts.map((alert, idx) => (
                  <Alert key={idx} severity={getAlertColor(alert.severity)} icon={getAlertIcon(alert.severity)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography variant="subtitle2">{alert.model_id}</Typography>
                        <Typography variant="body2">{alert.message}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Alert>
                ))}
              </Stack>
            </Paper>
          )}

          {/* No Alerts */}
          {liveMetrics.data.alerts.length === 0 && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              {t('Немає активних сповіщень. Всі моделі працюють нормально.')}
            </Alert>
          )}

          {/* Model Performance Cards */}
          <Typography variant="h6">{t('Детальна інформація по моделях')}</Typography>
          <Grid container spacing={2}>
            {Object.entries(liveMetrics.data.current_metrics).map(([modelId, metrics], idx) => {
              const rolling = liveMetrics.data?.rolling_metrics?.[modelId];
              const latestMae = rolling?.mae?.[rolling.mae.length - 1];
              const prevMae = rolling?.mae?.[rolling.mae.length - 2];
              const trend = latestMae && prevMae ? ((latestMae - prevMae) / prevMae) * 100 : 0;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={modelId}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {modelId}
                        </Typography>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: CHART_COLORS[idx % CHART_COLORS.length]
                          }}
                        />
                      </Box>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            MAE:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2">{metrics.mae.toFixed(4)}</Typography>
                            {trend !== 0 && (
                              <Chip
                                label={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`}
                                size="small"
                                color={trend < 0 ? 'success' : trend < 5 ? 'warning' : 'error'}
                              />
                            )}
                          </Box>
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

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>WebSocket</strong>: {t('Увімкніть для отримання метрик в реальному часі')} |{' '}
              <strong>Rolling Window</strong>: {liveMetrics.data.metadata.rolling_window} {t('спостережень')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!liveMetrics.data && !liveMetrics.isLoading && !liveMetrics.error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Натисніть "Оновити" для завантаження метрик')}</Typography>
        </Paper>
      )}
    </Box>
  );
});
