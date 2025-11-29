import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
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
import { LoadingFallback } from '../../../components/LoadingFallback';
import { useState } from 'react';

import { useApi } from '../../../context/useApi';

export const PeaksTab = () => {
  const { t } = useTranslation();
  const { peaksData, isLoadingPeaks, peaksError, getPeaks } = useApi();

  const [topN, setTopN] = useState<number>(10);
  const [granularity, setGranularity] = useState<'hourly' | 'daily'>('hourly');

  useEffect(() => {
    getPeaks({ top_n: topN, granularity });
  }, [getPeaks, topN, granularity]);

  const handleRefresh = () => {
    getPeaks({ top_n: topN, granularity });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (isLoadingPeaks) {
    return <LoadingFallback />;
  }

  if (peaksError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {peaksError}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('Кількість')}</InputLabel>
          <Select
            value={topN}
            label={t('Кількість')}
            onChange={(e: SelectChangeEvent<number>) => setTopN(e.target.value as number)}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t('Гранулярність')}</InputLabel>
          <Select
            value={granularity}
            label={t('Гранулярність')}
            onChange={(e: SelectChangeEvent<'hourly' | 'daily'>) =>
              setGranularity(e.target.value as 'hourly' | 'daily')
            }
          >
            <MenuItem value="hourly">{t('Погодинна')}</MenuItem>
            <MenuItem value="daily">{t('Денна')}</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t('Оновити')}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {peaksData && (
        <Stack spacing={3}>
          {/* Peak Hours Summary Cards */}
          {peaksData.peak_hours && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <WbSunnyIcon color="warning" />
                    <Typography variant="h6">{t('Ранковий пік')}</Typography>
                  </Stack>
                  <Typography variant="h3" color="warning.main">
                    {peaksData.peak_hours.morning_peak}:00
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TrendingUpIcon color="error" />
                    <Typography variant="h6">{t('Вечірній пік')}</Typography>
                  </Stack>
                  <Typography variant="h3" color="error.main">
                    {peaksData.peak_hours.evening_peak}:00
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TrendingDownIcon color="success" />
                    <Typography variant="h6">{t('Мінімальне навантаження')}</Typography>
                  </Stack>
                  <Typography variant="h3" color="success.main">
                    {peaksData.peak_hours.off_peak}:00
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* Max/Min Summary */}
          {(peaksData.peak_consumption || peaksData.low_consumption) && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {peaksData.peak_consumption && (
                <Card sx={{ flex: 1, borderLeft: 4, borderColor: 'error.main' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('Максимальне споживання')}
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {peaksData.peak_consumption.max_value?.toFixed(2) ?? '-'} kW
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {peaksData.peak_consumption.max_date ? formatDate(peaksData.peak_consumption.max_date) : '-'}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {peaksData.low_consumption && (
                <Card sx={{ flex: 1, borderLeft: 4, borderColor: 'success.main' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('Мінімальне споживання')}
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {peaksData.low_consumption.min_value?.toFixed(2) ?? '-'} kW
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {peaksData.low_consumption.min_date ? formatDate(peaksData.low_consumption.min_date) : '-'}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}

          {/* Top Peaks Table */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            {peaksData.peak_consumption?.top_peaks && (
              <Paper sx={{ flex: 1 }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <KeyboardArrowUpIcon color="error" />
                    <Typography variant="h6">{t('Топ пікових значень')}</Typography>
                  </Stack>
                </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>{t('Дата')}</TableCell>
                        <TableCell align="right">{t('Значення')} (kW)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {peaksData.peak_consumption.top_peaks.map((peak, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip
                              size="small"
                              label={index + 1}
                              color={index < 3 ? 'error' : 'default'}
                              variant={index < 3 ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>{formatDate(peak.date)}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={index < 3 ? 'bold' : 'normal'}>
                              {peak.value?.toFixed(2) ?? '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {peaksData.low_consumption?.top_lows && (
              <Paper sx={{ flex: 1 }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <KeyboardArrowDownIcon color="success" />
                    <Typography variant="h6">{t('Топ мінімальних значень')}</Typography>
                  </Stack>
                </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>{t('Дата')}</TableCell>
                        <TableCell align="right">{t('Значення')} (kW)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {peaksData.low_consumption.top_lows.map((low, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip
                              size="small"
                              label={index + 1}
                              color={index < 3 ? 'success' : 'default'}
                              variant={index < 3 ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>{formatDate(low.date)}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={index < 3 ? 'bold' : 'normal'}>
                              {low.value?.toFixed(2) ?? '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Stack>
        </Stack>
      )}

      {!peaksData && !isLoadingPeaks && !peaksError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Немає даних')}</Typography>
        </Paper>
      )}
    </Box>
  );
};
