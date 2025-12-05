import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';

import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
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
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent
} from '@mui/material';
import { useApi } from '../../../context/useApi';
import type { IScenarioResult } from '../../../types/api';

interface ScenarioForm {
  name: string;
  weather?: { temperature?: number; humidity?: number; wind_speed?: number };
  calendar?: { is_holiday?: boolean; is_weekend?: boolean };
  is_anomaly?: boolean;
}

const SCENARIO_COLORS = ['#1976d2', '#9c27b0', '#f44336', '#4caf50', '#ff9800', '#00bcd4'];

export const CompareTab = () => {
  const { t } = useTranslation();
  const { models, compareResult, isLoadingCompare, compareError, compareScenarios, clearCompare } = useApi();

  const [modelId, setModelId] = useState<string>('');
  const [forecastHorizon, setForecastHorizon] = useState<number>(7);
  const [scenarios, setScenarios] = useState<ScenarioForm[]>([
    { name: t('Тепла погода'), weather: { temperature: 25 }, calendar: {}, is_anomaly: false },
    { name: t('Холодна погода'), weather: { temperature: 5 }, calendar: {}, is_anomaly: false }
  ]);

  const supportedModels = models
    ? Object.entries(models).filter(([, info]) => info.supports_conditions && info.supports_simulation)
    : [];

  const handleAddScenario = () => {
    if (scenarios.length < 5) {
      setScenarios([...scenarios, { name: `${t('Сценарій')} ${scenarios.length + 1}`, weather: {}, calendar: {}, is_anomaly: false }]);
    }
  };

  const handleRemoveScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const handleScenarioChange = (index: number, field: keyof ScenarioForm, value: unknown) => {
    setScenarios(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } as ScenarioForm : s));
  };

  const handleWeatherChange = (index: number, field: string, value: number | undefined) => {
    setScenarios(prev => prev.map((s, i) =>
      i === index ? { ...s, weather: { ...s.weather, [field]: value } } : s
    ));
  };

  const handleCompare = () => {
    if (!modelId || scenarios.length < 1) return;

    const validScenarios = scenarios
      .filter((s) => s.name.trim())
      .map((s) => ({
        ...s,
        name: s.name.trim()
      }));

    if (validScenarios.length < 1) return;

    compareScenarios({
      model_id: modelId,
      forecast_horizon: forecastHorizon,
      scenarios: validScenarios
    });
  };

  const chartData = useMemo(() => {
    if (!compareResult) return [];

    const baselineDates = Object.keys(compareResult.baseline.forecast);
    const baselineValues = Object.values(compareResult.baseline.forecast);

    return baselineDates.map((date, index) => {
      const dataPoint: Record<string, string | number> = {
        date,
        formattedDate: new Date(date).toLocaleDateString(),
        baseline: baselineValues[index] ?? 0
      };

      compareResult.scenarios.forEach((scenario: IScenarioResult) => {
        const values = Object.values(scenario.forecast);
        dataPoint[scenario.name] = values[index] ?? 0;
      });

      return dataPoint;
    });
  }, [compareResult]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        {/* Configuration */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('Налаштування порівняння')}
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{t('Модель')}</InputLabel>
              <Select
                value={modelId}
                label={t('Модель')}
                onChange={(e: SelectChangeEvent) => setModelId(e.target.value)}
              >
                {supportedModels.map(([id, info]) => (
                  <MenuItem key={id} value={id}>
                    {id} ({info.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('Горизонт')}</InputLabel>
              <Select
                value={forecastHorizon}
                label={t('Горизонт')}
                onChange={(e: SelectChangeEvent<number>) => setForecastHorizon(e.target.value as number)}
              >
                <MenuItem value={3}>3 {t('дні')}</MenuItem>
                <MenuItem value={7}>7 {t('днів')}</MenuItem>
                <MenuItem value={14}>14 {t('днів')}</MenuItem>
                <MenuItem value={30}>30 {t('днів')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Scenarios */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{t('Сценарії')}</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddScenario}
              disabled={scenarios.length >= 5}
              size="small"
            >
              {t('Додати сценарій')}
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {scenarios.map((scenario, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Chip
                        size="small"
                        label={`#${index + 1}`}
                        sx={{ backgroundColor: SCENARIO_COLORS[index % SCENARIO_COLORS.length], color: 'white' }}
                      />
                      <Tooltip title={t('Видалити')}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveScenario(index)}
                          disabled={scenarios.length <= 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Stack spacing={2}>
                      <TextField
                        size="small"
                        label={t('Назва сценарію')}
                        value={scenario.name}
                        onChange={(e) => handleScenarioChange(index, 'name', e.target.value)}
                        fullWidth
                      />

                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          label={t('Температура (°C)')}
                          type="number"
                          value={scenario.weather?.temperature ?? ''}
                          onChange={(e) =>
                            handleWeatherChange(
                              index,
                              'temperature',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          label={t('Вологість (%)')}
                          type="number"
                          value={scenario.weather?.humidity ?? ''}
                          onChange={(e) =>
                            handleWeatherChange(
                              index,
                              'humidity',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                          sx={{ flex: 1 }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={isLoadingCompare ? <CircularProgress size={20} /> : <CompareArrowsIcon />}
              onClick={handleCompare}
              disabled={!modelId || scenarios.length < 1 || isLoadingCompare}
            >
              {t('Порівняти')}
            </Button>
            {compareResult && (
              <Button variant="outlined" onClick={clearCompare}>
                {t('Очистити')}
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Error */}
        {compareError && (
          <Alert severity="error">{compareError}</Alert>
        )}

        {/* Results */}
        {compareResult && (
          <>
            {/* Chart */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Порівняння прогнозів')}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 30, 30, 0.9)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} kW`,
                      name === 'baseline' ? `${compareResult.baseline.name} (${t('базовий')})` : name
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#757575"
                    strokeDasharray="5 5"
                    name={`${compareResult.baseline.name} (${t('базовий')})`}
                    dot={false}
                  />
                  {compareResult.scenarios.map((scenario: IScenarioResult, index: number) => (
                    <Line
                      key={scenario.name}
                      type="monotone"
                      dataKey={scenario.name}
                      stroke={SCENARIO_COLORS[index % SCENARIO_COLORS.length]}
                      name={scenario.name}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Summary Table */}
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Підсумок')}</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Сценарій')}</TableCell>
                      <TableCell align="right">{t('Загальне споживання')} (kW)</TableCell>
                      <TableCell align="right">{t('Середнє за день')} (kW)</TableCell>
                      <TableCell align="right">{t('Різниця від базового')}</TableCell>
                      <TableCell align="right">{t('Різниця %')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip size="small" label={t('Базовий')} />
                          <Typography>{compareResult.baseline.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{compareResult.baseline.total_consumption.toFixed(2)}</TableCell>
                      <TableCell align="right">{compareResult.baseline.avg_daily.toFixed(2)}</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                    {compareResult.scenarios.map((scenario: IScenarioResult, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: SCENARIO_COLORS[index % SCENARIO_COLORS.length]
                              }}
                            />
                            <Typography>{scenario.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{scenario.total_consumption.toFixed(2)}</TableCell>
                        <TableCell align="right">{scenario.avg_daily.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          {scenario.difference_from_baseline !== undefined && (
                            <Typography
                              color={scenario.difference_from_baseline > 0 ? 'error.main' : 'success.main'}
                            >
                              {scenario.difference_from_baseline > 0 ? '+' : ''}
                              {scenario.difference_from_baseline.toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {scenario.difference_percent !== undefined && (
                            <Chip
                              size="small"
                              label={`${scenario.difference_percent > 0 ? '+' : ''}${scenario.difference_percent.toFixed(1)}%`}
                              color={scenario.difference_percent > 0 ? 'error' : 'success'}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Metadata */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  {t('Модель')}: <strong>{compareResult.model_id}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Горизонт')}: <strong>{compareResult.metadata.forecast_horizon} {t('днів')}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Час виконання')}: <strong>{compareResult.metadata.latency_ms} ms</strong>
                </Typography>
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Box>
  );
};
