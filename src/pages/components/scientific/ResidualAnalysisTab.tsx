import { memo, useState } from 'react';
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

import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi';

export const ResidualAnalysisTab = memo(function ResidualAnalysisTab() {
  const { t } = useTranslation();
  const {
    models,
    isLoadingModels,
    residualAnalysisResult,
    isLoadingResidualAnalysis,
    residualAnalysisError,
    runResidualAnalysis
  } = useApi();

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
    runResidualAnalysis({
      model_id: selectedModel,
      test_size_days: testDays,
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
            disabled={!selectedModel || isLoadingResidualAnalysis}
            fullWidth
          >
            {t('Запустити аналіз залишків')}
          </Button>
        </Stack>
      </Paper>

      {/* Loading State */}
      {isLoadingResidualAnalysis && <LoadingFallback />}

      {/* Error State */}
      {residualAnalysisError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {residualAnalysisError}
        </Alert>
      )}

      {/* Results */}
      {residualAnalysisResult && !isLoadingResidualAnalysis && (
        <Stack spacing={3}>
          {/* Model Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Модель')}: {residualAnalysisResult.model_id}
              </Typography>
            </CardContent>
          </Card>

          {/* Basic Statistics */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{t('Основні статистики залишків')}</Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ p: 2, flexWrap: 'wrap' }}>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Середнє')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.mean.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Стд. відхилення')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.std.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Медіана')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.median.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Мінімум')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.min.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Максимум')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.max.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Q25')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.q25.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('Q75')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.q75.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 150, flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('IQR')}
                  </Typography>
                  <Typography variant="h6">{residualAnalysisResult.basic_statistics.iqr.toFixed(4)}</Typography>
                </CardContent>
              </Card>
            </Stack>
          </Paper>

          {/* Normality Tests */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{t('Тести нормальності')}</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Тест')}</TableCell>
                    <TableCell align="center">{t('Статистика')}</TableCell>
                    <TableCell align="center">p-value</TableCell>
                    <TableCell align="center">{t('Нормальний розподіл?')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>Shapiro-Wilk</TableCell>
                    <TableCell align="center">
                      {residualAnalysisResult.normality.shapiro_wilk.statistic.toFixed(6)}
                    </TableCell>
                    <TableCell align="center">
                      {residualAnalysisResult.normality.shapiro_wilk.p_value.toFixed(6)}
                    </TableCell>
                    <TableCell align="center">
                      {residualAnalysisResult.normality.shapiro_wilk.is_normal ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Kolmogorov-Smirnov</TableCell>
                    <TableCell align="center">
                      {residualAnalysisResult.normality.kolmogorov_smirnov.statistic.toFixed(6)}
                    </TableCell>
                    <TableCell align="center">
                      {residualAnalysisResult.normality.kolmogorov_smirnov.p_value.toFixed(6)}
                    </TableCell>
                    <TableCell align="center">
                      {residualAnalysisResult.normality.kolmogorov_smirnov.is_normal ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2">
                    <strong>{t('Асиметрія (Skewness)')}:</strong> {residualAnalysisResult.normality.skewness.toFixed(4)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2">
                    <strong>{t('Ексцес (Kurtosis)')}:</strong> {residualAnalysisResult.normality.kurtosis.toFixed(4)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>

          {/* Autocorrelation */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{t('Автокореляція')}</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Лаг')}</TableCell>
                    <TableCell align="center">{t('Кореляція')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(residualAnalysisResult.autocorrelation).map(([lag, corr]) => (
                    <TableRow key={lag} hover>
                      <TableCell>{lag}</TableCell>
                      <TableCell align="center">{corr !== null ? corr.toFixed(4) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Plots */}
          {residualAnalysisResult.plots && Object.keys(residualAnalysisResult.plots).length > 0 && (
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{t('Візуалізації')}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {Object.entries(residualAnalysisResult.plots).map(([plotName, base64Image]) => (
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
              • {t('Середнє близьке до 0 вказує на відсутність систематичного зсуву')}
              <br />• {t('Тести нормальності: p-value > 0.05 вказує на нормальний розподіл')}
              <br />• {t('Автокореляція: значення близькі до 0 вказують на незалежність залишків')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!residualAnalysisResult && !isLoadingResidualAnalysis && !residualAnalysisError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Виберіть модель і запустіть аналіз для перегляду результатів')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
});
