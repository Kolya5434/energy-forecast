import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
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
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { LoadingFallback } from '../../../components/LoadingFallback';
import { useApi } from '../../../context/useApi';

export const ErrorAnalysisTab = () => {
  const { t } = useTranslation();
  const { models, isLoadingModels, errorAnalysisResult, isLoadingErrorAnalysis, errorAnalysisError, runErrorAnalysis } =
    useApi();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testDays, setTestDays] = useState<number>(30);

  // Get ML models only
  const mlModels = models
    ? Object.entries(models)
        .filter(([, info]) => info.type === 'ml')
        .map(([id]) => id)
    : [];

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  const handleRunAnalysis = () => {
    if (!selectedModel) return;
    runErrorAnalysis({
      model_id: selectedModel,
      test_size_days: testDays,
      include_temporal: true,
      include_plots: true
    });
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Налаштування аналізу')}
        </Typography>

        <Stack spacing={2}>
          {/* Model Selection */}
          <FormControl fullWidth>
            <InputLabel>{t('Виберіть модель')}</InputLabel>
            <Select value={selectedModel} onChange={handleModelChange} disabled={isLoadingModels}>
              {mlModels.map((modelId) => (
                <MenuItem key={modelId} value={modelId}>
                  {modelId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Test Days Slider */}
          <Box>
            <Typography gutterBottom>
              {t('Тестовий період (днів)')}: {testDays}
            </Typography>
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
            onClick={handleRunAnalysis}
            disabled={!selectedModel || isLoadingErrorAnalysis}
            fullWidth
          >
            {t('Запустити аналіз помилок')}
          </Button>
        </Stack>
      </Paper>

      {/* Loading State */}
      {isLoadingErrorAnalysis && <LoadingFallback />}

      {/* Error State */}
      {errorAnalysisError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorAnalysisError}
        </Alert>
      )}

      {/* Results */}
      {errorAnalysisResult && !isLoadingErrorAnalysis && (
        <Stack spacing={3}>
          {/* Model Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Модель')}: {errorAnalysisResult.model_id}
              </Typography>
            </CardContent>
          </Card>

          {/* Overall Metrics */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{t('Загальні метрики помилок')}</Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ p: 2, flexWrap: 'wrap' }}>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    MAE
                  </Typography>
                  <Typography variant="h6">{errorAnalysisResult.metrics.mae.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    RMSE
                  </Typography>
                  <Typography variant="h6">{errorAnalysisResult.metrics.rmse.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    MAPE (%)
                  </Typography>
                  <Typography variant="h6">{errorAnalysisResult.metrics.mape.toFixed(2)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    R²
                  </Typography>
                  <Typography variant="h6">{errorAnalysisResult.metrics.r2.toFixed(4)}</Typography>
                </CardContent>
              </Card>
            </Stack>
          </Paper>

          {/* Temporal Patterns */}
          {errorAnalysisResult.temporal_patterns && (
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Часові паттерни помилок')}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {/* Hourly */}
                  {errorAnalysisResult.temporal_patterns.hourly && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('Погодинні паттерни')}
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('Година')}</TableCell>
                              <TableCell align="right">{t('Середня помилка')}</TableCell>
                              <TableCell align="right">{t('Стд. відхилення')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(errorAnalysisResult.temporal_patterns.hourly).map(([hour, metrics]) => (
                              <TableRow key={hour} hover>
                                <TableCell>{hour}:00</TableCell>
                                <TableCell align="right">{metrics.mean_error.toFixed(3)}</TableCell>
                                <TableCell align="right">{metrics.std_error.toFixed(3)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Daily */}
                  {errorAnalysisResult.temporal_patterns.daily && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('Денні паттерни')}
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('День')}</TableCell>
                              <TableCell align="right">{t('Середня помилка')}</TableCell>
                              {errorAnalysisResult.temporal_patterns.daily &&
                                Object.values(errorAnalysisResult.temporal_patterns.daily)[0]?.std_error !==
                                  undefined && <TableCell align="right">{t('Стд. відхилення')}</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(errorAnalysisResult.temporal_patterns.daily).map(([day, metrics]) => (
                              <TableRow key={day} hover>
                                <TableCell>{day}</TableCell>
                                <TableCell align="right">{metrics.mean_error.toFixed(3)}</TableCell>
                                {metrics.std_error !== undefined && (
                                  <TableCell align="right">{metrics.std_error.toFixed(3)}</TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Monthly */}
                  {errorAnalysisResult.temporal_patterns.monthly && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('Місячні паттерни')}
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('Місяць')}</TableCell>
                              <TableCell align="right">{t('Середня помилка')}</TableCell>
                              {errorAnalysisResult.temporal_patterns.monthly &&
                                Object.values(errorAnalysisResult.temporal_patterns.monthly)[0]?.std_error !==
                                  undefined && <TableCell align="right">{t('Стд. відхилення')}</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(errorAnalysisResult.temporal_patterns.monthly).map(([month, metrics]) => (
                              <TableRow key={month} hover>
                                <TableCell>{month}</TableCell>
                                <TableCell align="right">{metrics.mean_error.toFixed(3)}</TableCell>
                                {metrics.std_error !== undefined && (
                                  <TableCell align="right">{metrics.std_error.toFixed(3)}</TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Paper>
          )}

          {/* Error Distribution */}
          {errorAnalysisResult.error_distribution && (
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Розподіл помилок')}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('Гістограма помилок прогнозування')}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Діапазон помилок')}</TableCell>
                        <TableCell align="right">{t('Кількість')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(errorAnalysisResult.error_distribution.histogram).map(([range, count]) => (
                        <TableRow key={range} hover>
                          <TableCell>{range}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          )}

          {/* Large Errors */}
          {errorAnalysisResult.large_errors && errorAnalysisResult.large_errors.length > 0 && (
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Найбільші помилки')}</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Час')}</TableCell>
                      <TableCell align="right">{t('Фактичне')}</TableCell>
                      <TableCell align="right">{t('Прогноз')}</TableCell>
                      <TableCell align="right">{t('Помилка')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {errorAnalysisResult.large_errors.map((pred, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{new Date(pred.timestamp).toLocaleString()}</TableCell>
                        <TableCell align="right">{pred.actual.toFixed(2)}</TableCell>
                        <TableCell align="right">{pred.predicted.toFixed(2)}</TableCell>
                        <TableCell align="right">{pred.error.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Plots */}
          {errorAnalysisResult.plots && Object.keys(errorAnalysisResult.plots).length > 0 && (
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Візуалізації')}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {Object.entries(errorAnalysisResult.plots).map(([plotName, base64Image]) => (
                  <Box key={plotName} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {plotName}
                    </Typography>
                    <img
                      src={`data:image/png;base64,${base64Image}`}
                      alt={plotName}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Interpretation */}
          <Alert severity="info">
            <Typography variant="body2" gutterBottom>
              <strong>{t('Інтерпретація')}:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • {t('Часові паттерни показують, як помилки змінюються протягом дня, тижня та місяця')}
              <br />
              • {t('Розподіл помилок допомагає зрозуміти варіативність прогнозів')}
              <br />• {t('Найбільші помилки вказують на випадки, які потребують особливої уваги')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!errorAnalysisResult && !isLoadingErrorAnalysis && !errorAnalysisError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('Виберіть модель і запустіть аналіз для перегляду результатів')}</Typography>
        </Paper>
      )}
    </Box>
  );
};
