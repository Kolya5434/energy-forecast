import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';

import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
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
  Tooltip,
  Typography,
  type SelectChangeEvent
} from '@mui/material';
import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi';

export const AnomaliesTab = () => {
  const { t } = useTranslation();
  const { anomaliesData, isLoadingAnomalies, anomaliesError, getAnomalies } = useApi();

  const [threshold, setThreshold] = useState<number>(2.0);
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    getAnomalies({ threshold, days, include_details: true });
  }, [getAnomalies, threshold, days]);

  const handleRefresh = () => {
    getAnomalies({ threshold, days, include_details: true });
  };

  const hourlyChartData = useMemo(() => {
    if (!anomaliesData) return [];
    return Object.entries(anomaliesData.anomalies_by_hour)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count
      }));
  }, [anomaliesData]);

  const dailyChartData = useMemo(() => {
    if (!anomaliesData) return [];
    const dayNames = [t('Пн'), t('Вт'), t('Ср'), t('Чт'), t('Пт'), t('Сб'), t('Нд')];
    return Object.entries(anomaliesData.anomalies_by_day)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([day, count]) => ({
        day: dayNames[Number(day)] || day,
        count
      }));
  }, [anomaliesData, t]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (isLoadingAnomalies) {
    return <LoadingFallback />;
  }

  if (anomaliesError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {anomaliesError}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }} flexWrap="wrap">
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            {t('Поріг')} (σ): {threshold}
          </Typography>
          <Slider
            value={threshold}
            onChange={(_, value) => setThreshold(value as number)}
            min={1.5}
            max={3.0}
            step={0.1}
            marks={[
              { value: 1.5, label: '1.5' },
              { value: 2.0, label: '2.0' },
              { value: 2.5, label: '2.5' },
              { value: 3.0, label: '3.0' }
            ]}
            size="small"
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('Днів')}</InputLabel>
          <Select
            value={days}
            label={t('Днів')}
            onChange={(e: SelectChangeEvent<number>) => setDays(e.target.value as number)}
          >
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={14}>14</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={60}>60</MenuItem>
            <MenuItem value={90}>90</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t('Оновити')}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {anomaliesData && (
        <Stack spacing={3}>
          {/* Summary Cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <WarningAmberIcon color="warning" />
                  <Typography variant="h6">{t('Всього аномалій')}</Typography>
                </Stack>
                <Typography variant="h3" color="warning.main">
                  {anomaliesData.anomaly_count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {anomaliesData.anomaly_percentage.toFixed(1)}% {t('від загальних даних')}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, borderLeft: 4, borderColor: 'error.main' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUpIcon color="error" />
                  <Typography variant="h6">{t('Високі аномалії')}</Typography>
                </Stack>
                <Typography variant="h3" color="error.main">
                  {anomaliesData.high_anomalies.count}
                </Typography>
                {anomaliesData.high_anomalies.max_value && (
                  <Typography variant="caption" color="text.secondary">
                    {t('Макс')}: {anomaliesData.high_anomalies.max_value.toFixed(2)} kW
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, borderLeft: 4, borderColor: 'info.main' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingDownIcon color="info" />
                  <Typography variant="h6">{t('Низькі аномалії')}</Typography>
                </Stack>
                <Typography variant="h3" color="info.main">
                  {anomaliesData.low_anomalies.count}
                </Typography>
                {anomaliesData.low_anomalies.min_value && (
                  <Typography variant="caption" color="text.secondary">
                    {t('Мін')}: {anomaliesData.low_anomalies.min_value.toFixed(2)} kW
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Stack>

          {/* Charts */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <Paper sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Аномалії за годинами')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 30, 30, 0.9)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, t('Кількість')]}
                  />
                  <Bar dataKey="count" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Аномалії за днями тижня')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 30, 30, 0.9)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, t('Кількість')]}
                  />
                  <Bar dataKey="count" fill="#e91e63" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>

          {/* Anomaly Details Tables */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            {/* High Anomalies */}
            <Paper sx={{ flex: 1 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon color="error" />
                  <Typography variant="h6">{t('Високі аномалії')}</Typography>
                  <Chip size="small" label={anomaliesData.high_anomalies.count} color="error" />
                </Stack>
              </Box>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>{t('Дата')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {anomaliesData.high_anomalies.dates.slice(0, 20).map((date, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{formatDate(date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Low Anomalies */}
            <Paper sx={{ flex: 1 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingDownIcon color="info" />
                  <Typography variant="h6">{t('Низькі аномалії')}</Typography>
                  <Chip size="small" label={anomaliesData.low_anomalies.count} color="info" />
                </Stack>
              </Box>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>{t('Дата')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {anomaliesData.low_anomalies.dates.slice(0, 20).map((date, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{formatDate(date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </Stack>
      )}

      {!anomaliesData && !isLoadingAnomalies && !anomaliesError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Немає даних')}</Typography>
        </Paper>
      )}
    </Box>
  );
};
