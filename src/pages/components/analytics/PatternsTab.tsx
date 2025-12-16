import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Card,
  CardContent,
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
import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi';
import type { PatternPeriod } from '@/types/api';

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
  const isSimplePattern = useMemo(() => {
    if (!patternsData?.pattern) return false;
    const firstValue = Object.values(patternsData.pattern)[0];
    return typeof firstValue === 'number' || firstValue === null;
  }, [patternsData]);

  const chartData = useMemo(() => {
    if (!patternsData?.pattern) return [];

    const entries = Object.entries(patternsData.pattern);

    if (isSimplePattern) {
      return entries.map(([label, value]) => ({
        label,
        value: value as unknown as number
      }));
    }

    return entries.map(([label, stats]) => ({
      label,
      mean: (stats as { mean?: number })?.mean ?? 0,
      min: (stats as { min?: number })?.min ?? 0,
      max: (stats as { max?: number })?.max ?? 0
    }));
  }, [patternsData, isSimplePattern]);

  if (isLoadingPatterns) {
    return <LoadingFallback />;
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
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  angle={period === 'hourly' ? 0 : -45}
                  textAnchor={period === 'hourly' ? 'middle' : 'end'}
                  height={period === 'hourly' ? 30 : 60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 30, 0.9)',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    `${((value as number) ?? 0).toFixed(3)} kW`,
                    name === 'value' ? t('Значення') : name === 'mean' ? t('Середнє') : name === 'min' ? t('Мін') : t('Макс')
                  ]}
                />
                {isSimplePattern ? (
                  <Bar dataKey="value" fill="#1976d2" name={t('Значення')} />
                ) : (
                  <>
                    <Legend />
                    <Bar dataKey="mean" fill="#1976d2" name={t('Середнє')} />
                    <Line type="monotone" dataKey="min" stroke="#4caf50" strokeDasharray="5 5" name={t('Мін')} dot={false} />
                    <Line type="monotone" dataKey="max" stroke="#f44336" strokeDasharray="5 5" name={t('Макс')} dot={false} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
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
                    {isSimplePattern ? (
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
                        {isSimplePattern ? (
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
