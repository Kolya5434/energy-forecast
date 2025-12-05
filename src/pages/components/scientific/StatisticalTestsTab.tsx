import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
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

export const StatisticalTestsTab = () => {
  const { t } = useTranslation();
  const { models, isLoadingModels, statisticalTestsResult, isLoadingStatisticalTests, statisticalTestsError, runStatisticalTests } =
    useApi();

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [testDays, setTestDays] = useState<number>(30);

  // Get ML models only
  const mlModels = models
    ? Object.entries(models)
        .filter(([, info]) => info.type === 'ml')
        .map(([id]) => id)
    : [];

  const handleModelChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedModels(typeof value === 'string' ? value.split(',') : value);
  };

  const handleRunTests = () => {
    if (selectedModels.length < 2) {
      return;
    }
    runStatisticalTests({
      model_ids: selectedModels,
      test_size_days: testDays
    });
  };

  const getEffectSizeColor = (interpretation: string) => {
    switch (interpretation) {
      case 'large':
        return 'error';
      case 'medium':
        return 'warning';
      case 'small':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Налаштування тестів')}
        </Typography>

        <Stack spacing={2}>
          {/* Model Selection */}
          <FormControl fullWidth>
            <InputLabel>{t('Виберіть моделі для порівняння')}</InputLabel>
            <Select
              multiple
              value={selectedModels}
              onChange={handleModelChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              disabled={isLoadingModels}
            >
              {mlModels.map((modelId) => (
                <MenuItem key={modelId} value={modelId}>
                  <Checkbox checked={selectedModels.indexOf(modelId) > -1} />
                  <ListItemText primary={modelId} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Test Days Slider */}
          <Box>
            <Typography gutterBottom>{t('Тестовий період (днів)')}: {testDays}</Typography>
            <Slider
              value={testDays}
              onChange={(_, newValue) => setTestDays(newValue as number)}
              min={7}
              max={90}
              step={1}
              marks={[
                { value: 7, label: '7' },
                { value: 30, label: '30' },
                { value: 60, label: '60' },
                { value: 90, label: '90' }
              ]}
            />
          </Box>

          {/* Run Button */}
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunTests}
            disabled={selectedModels.length < 2 || isLoadingStatisticalTests}
            fullWidth
          >
            {t('Запустити статистичні тести')}
          </Button>

          {selectedModels.length < 2 && (
            <Alert severity="info">{t('Виберіть принаймні 2 моделі для порівняння')}</Alert>
          )}
        </Stack>
      </Paper>

      {/* Loading State */}
      {isLoadingStatisticalTests && <LoadingFallback />}

      {/* Error State */}
      {statisticalTestsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statisticalTestsError}
        </Alert>
      )}

      {/* Results */}
      {statisticalTestsResult && !isLoadingStatisticalTests && (
        <Stack spacing={3}>
          {/* Summary Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Підсумок')}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Tooltip title={t('Кількість моделей, що порівнюються в аналізі')}>
                  <Chip label={`${t('Моделей')}: ${statisticalTestsResult.num_models}`} />
                </Tooltip>
                <Tooltip title={t('Кількість спостережень у тестовому наборі даних')}>
                  <Chip label={`${t('Розмір вибірки')}: ${statisticalTestsResult.sample_size}`} />
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>

          {/* Friedman Test */}
          {statisticalTestsResult.friedman_test && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Тест Фрідмана')}
                </Typography>
                <Stack spacing={1}>
                  <Typography>
                    <strong>{t('Статистика')}:</strong> {statisticalTestsResult.friedman_test.statistic.toFixed(4)}
                  </Typography>
                  <Typography>
                    <strong>p-value:</strong> {statisticalTestsResult.friedman_test.p_value.toFixed(6)}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {statisticalTestsResult.friedman_test.significant ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                    <Typography>
                      {statisticalTestsResult.friedman_test.significant
                        ? t('Є статистично значуща різниця між моделями')
                        : t('Немає статистично значущої різниці')}
                    </Typography>
                  </Stack>
                  <Alert severity={statisticalTestsResult.friedman_test.significant ? 'success' : 'warning'}>
                    {statisticalTestsResult.friedman_test.interpretation}
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Pairwise Comparisons */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{t('Попарні порівняння')}</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Порівняння')}</TableCell>
                    <TableCell align="center">{t('Краща модель')}</TableCell>
                    <TableCell align="center">t-test p-value</TableCell>
                    <TableCell align="center">{t('Wilcoxon p-value')}</TableCell>
                    <TableCell align="center">{t('Розмір ефекту')}</TableCell>
                    <TableCell align="center">{t('Значущість')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(statisticalTestsResult.pairwise_tests).map(([comparison, test]) => (
                    <TableRow key={comparison} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {comparison.replace('_vs_', ' vs ')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={t('Модель з найменшою середньою помилкою в цьому порівнянні')}>
                          <Chip label={test.better_model} color="primary" size="small" />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Статистика: ${test.t_test.statistic.toFixed(4)}`}>
                          <Typography
                            sx={{
                              color: test.t_test.significant ? 'success.main' : 'text.secondary',
                              fontWeight: test.t_test.significant ? 'bold' : 'normal'
                            }}
                          >
                            {test.t_test.p_value.toFixed(6)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Статистика: ${test.wilcoxon_test.statistic.toFixed(0)}`}>
                          <Typography
                            sx={{
                              color: test.wilcoxon_test.significant ? 'success.main' : 'text.secondary',
                              fontWeight: test.wilcoxon_test.significant ? 'bold' : 'normal'
                            }}
                          >
                            {test.wilcoxon_test.p_value.toFixed(6)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Cohen's d: ${test.effect_size.cohens_d.toFixed(4)}`}>
                          <Chip
                            label={test.effect_size.interpretation}
                            color={getEffectSizeColor(test.effect_size.interpretation)}
                            size="small"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        {test.t_test.significant || test.wilcoxon_test.significant ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="disabled" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Interpretation Help */}
          <Alert severity="info">
            <Typography variant="body2" gutterBottom>
              <strong>{t('Інтерпретація')}:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • p-value &lt; 0.05 вказує на статистично значущу різницю
              <br />
              • {t('Розмір ефекту')}: negligible (дуже малий), small (малий), medium (середній), large (великий)
              <br />• {t('Зелений колір означає статистично значущу різницю')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!statisticalTestsResult && !isLoadingStatisticalTests && !statisticalTestsError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Виберіть моделі та запустіть тести для перегляду результатів')}</Typography>
        </Paper>
      )}
    </Box>
  );
};
