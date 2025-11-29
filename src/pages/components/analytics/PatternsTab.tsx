import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { OptimizedEChart } from '../../../components/OptimizedEChart';
import { useApi } from '../../../context/useApi';
import type { PatternPeriod } from '../../../types/api';

const PERIOD_LABELS: Record<PatternPeriod, string> = {
  hourly: 'Погодинний',
  daily: 'Денний',
  weekly: 'Тижневий',
  monthly: 'Місячний',
  yearly: 'Річний'
};

export const PatternsTab = () => {
  const { t } = useTranslation();
  const { patternsData, isLoadingPatterns, patternsError, getPatterns } = useApi();

  const [period, setPeriod] = useState<PatternPeriod>('hourly');

  useEffect(() => {
    getPatterns({ period });
  }, [getPatterns, period]);

  const handleRefresh = () => {
    getPatterns({ period });
  };

  // Check if pattern values are simple numbers or objects with stats
  const isSimplePattern = (): boolean => {
    if (!patternsData?.pattern) return false;
    const firstValue = Object.values(patternsData.pattern)[0];
    return typeof firstValue === 'number' || firstValue === null;
  };

  const simplePattern = isSimplePattern();

  const getChartOption = () => {
    if (!patternsData?.pattern) return {};

    const entries = Object.entries(patternsData.pattern);
    const labels = entries.map(([key]) => key);

    // Handle both formats: simple numbers or objects with stats
    if (simplePattern) {
      const values = entries.map(([, val]) => val as unknown as number);
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { rotate: labels.length > 10 ? 45 : 0 }
        },
        yAxis: { type: 'value', name: 'kW' },
        series: [
          {
            name: t('Значення'),
            type: 'bar',
            data: values,
            itemStyle: { color: '#1976d2' }
          }
        ]
      };
    }

    // Object format with stats
    const means = entries.map(([, stats]) => (stats as { mean?: number })?.mean ?? 0);
    const mins = entries.map(([, stats]) => (stats as { min?: number })?.min ?? 0);
    const maxs = entries.map(([, stats]) => (stats as { max?: number })?.max ?? 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: [t('Середнє'), t('Мін'), t('Макс')],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: period === 'hourly' ? 0 : 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'kW'
      },
      series: [
        {
          name: t('Середнє'),
          type: 'bar',
          data: means,
          itemStyle: { color: '#1976d2' }
        },
        {
          name: t('Мін'),
          type: 'line',
          data: mins,
          itemStyle: { color: '#4caf50' },
          lineStyle: { type: 'dashed' }
        },
        {
          name: t('Макс'),
          type: 'line',
          data: maxs,
          itemStyle: { color: '#f44336' },
          lineStyle: { type: 'dashed' }
        }
      ]
    };
  };

  if (isLoadingPatterns) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (patternsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {patternsError}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('Період')}</InputLabel>
          <Select
            value={period}
            label={t('Період')}
            onChange={(e: SelectChangeEvent<PatternPeriod>) => setPeriod(e.target.value as PatternPeriod)}
          >
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {t(label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title={t('Оновити')}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {patternsData && (
        <Stack spacing={3}>
          {/* Summary Cards */}
          {patternsData.peak_hour !== undefined && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('Година пікового споживання')}
                  </Typography>
                  <Typography variant="h3" color="error.main">
                    {patternsData.peak_hour}:00
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('Година мінімального споживання')}
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {patternsData.off_peak_hour}:00
                  </Typography>
                </CardContent>
              </Card>

              {patternsData.peak_to_offpeak_ratio && (
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('Співвідношення пік/мінімум')}
                    </Typography>
                    <Typography variant="h3" color="primary.main">
                      {patternsData.peak_to_offpeak_ratio.toFixed(2)}x
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}

          {/* Chart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Сезонний патерн')}: {t(PERIOD_LABELS[patternsData.period])}
            </Typography>
            <OptimizedEChart option={getChartOption()} style={{ height: 400 }} />
          </Paper>

          {/* Data Table */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{t('Детальна статистика')}</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Період')}</TableCell>
                    {simplePattern ? (
                      <TableCell align="right">{t('Значення')} (kW)</TableCell>
                    ) : (
                      <>
                        <TableCell align="right">{t('Середнє')} (kW)</TableCell>
                        <TableCell align="right">{t('Мін')} (kW)</TableCell>
                        <TableCell align="right">{t('Макс')} (kW)</TableCell>
                        <TableCell align="right">{t('Стд. відхилення')}</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(patternsData.pattern).map(([key, value]) => {
                    const v = value as unknown;
                    return (
                      <TableRow key={key} hover>
                        <TableCell>{key}</TableCell>
                        {simplePattern ? (
                          <TableCell align="right">{(v as number).toFixed(3)}</TableCell>
                        ) : (
                          <>
                            <TableCell align="right">{(v as { mean?: number })?.mean?.toFixed(3) ?? '-'}</TableCell>
                            <TableCell align="right">{(v as { min?: number })?.min?.toFixed(3) ?? '-'}</TableCell>
                            <TableCell align="right">{(v as { max?: number })?.max?.toFixed(3) ?? '-'}</TableCell>
                            <TableCell align="right">{(v as { std?: number })?.std?.toFixed(3) ?? '-'}</TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}

      {!patternsData && !isLoadingPatterns && !patternsError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Немає даних')}</Typography>
        </Paper>
      )}
    </Box>
  );
};
