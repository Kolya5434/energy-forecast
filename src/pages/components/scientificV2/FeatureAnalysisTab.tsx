import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import CategoryIcon from '@mui/icons-material/Category';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip as MuiTooltip,
  Typography
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useFeatureAnalysis, useFeatureSelection } from '@/hooks/useScientificV2';

import { Base64Image, ModelSelector } from './shared';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d084d0'];

export const FeatureAnalysisTab = () => {
  const { t } = useTranslation();
  const featureAnalysis = useFeatureAnalysis();
  const featureSelection = useFeatureSelection();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [analysisTypes, setAnalysisTypes] = useState<('rfe' | 'mutual_info' | 'permutation' | 'correlation' | 'vif')[]>([
    'mutual_info',
    'permutation',
    'correlation'
  ]);
  const [nFeatures, setNFeatures] = useState<number>(15);

  const handleRun = () => {
    if (!selectedModel || analysisTypes.length === 0) return;
    featureAnalysis.execute({
      model_id: selectedModel,
      analysis_types: analysisTypes,
      n_features_to_select: nFeatures
    });
  };

  const handleQuickSelection = () => {
    if (!selectedModel) return;
    featureSelection.execute(selectedModel, 'importance', nFeatures);
  };

  // Prepare mutual info chart data
  const mutualInfoData = useMemo(() => {
    if (!featureAnalysis.data?.mutual_info_scores) return [];

    return Object.entries(featureAnalysis.data.mutual_info_scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, nFeatures)
      .map(([feature, score]) => ({
        feature,
        score
      }));
  }, [featureAnalysis.data, nFeatures]);

  // Prepare permutation importance chart data
  const permutationData = useMemo(() => {
    if (!featureAnalysis.data?.permutation_importance) return [];

    return Object.entries(featureAnalysis.data.permutation_importance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, nFeatures)
      .map(([feature, importance]) => ({
        feature,
        importance
      }));
  }, [featureAnalysis.data, nFeatures]);

  // Prepare VIF data
  const vifData = useMemo(() => {
    if (!featureAnalysis.data?.vif_scores || 'error' in featureAnalysis.data.vif_scores) return [];

    return Object.entries(featureAnalysis.data.vif_scores as Record<string, number>)
      .sort(([, a], [, b]) => b - a)
      .map(([feature, vif]) => ({
        feature,
        vif,
        status: vif > 10 ? 'high' : vif > 5 ? 'medium' : 'low' as const
      }));
  }, [featureAnalysis.data]);

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('Аналіз ознак')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ModelSelector
              selectedModels={selectedModel ? [selectedModel] : []}
              onChange={(models) => setSelectedModel(models[0] || '')}
              multiple={false}
              label={t('Виберіть модель')}
              filterTypes={['ml', 'ensemble']}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>
              {t('Кількість ознак для вибору')}: {nFeatures}
            </Typography>
            <Slider
              value={nFeatures}
              onChange={(_, v) => setNFeatures(v as number)}
              min={5}
              max={50}
              step={5}
              marks={[
                { value: 5, label: '5' },
                { value: 15, label: '15' },
                { value: 30, label: '30' },
                { value: 50, label: '50' }
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography gutterBottom>{t('Типи аналізу')}</Typography>
            <ToggleButtonGroup
              value={analysisTypes}
              onChange={(_, newTypes) => newTypes.length > 0 && setAnalysisTypes(newTypes)}
              size="small"
            >
              <ToggleButton value="mutual_info">Mutual Info</ToggleButton>
              <ToggleButton value="permutation">Permutation</ToggleButton>
              <ToggleButton value="correlation">Correlation</ToggleButton>
              <ToggleButton value="vif">VIF</ToggleButton>
              <ToggleButton value="rfe">RFE</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={!selectedModel || analysisTypes.length === 0 || featureAnalysis.isLoading}
              fullWidth
            >
              {t('Повний аналіз')}
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              variant="outlined"
              onClick={handleQuickSelection}
              disabled={!selectedModel || featureSelection.isLoading}
              fullWidth
            >
              {t('Швидкий вибір ознак')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {featureAnalysis.isLoading && <LoadingFallback />}

      {/* Error */}
      {featureAnalysis.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {featureAnalysis.error}
        </Alert>
      )}

      {/* Quick Selection Results */}
      {featureSelection.data && !featureAnalysis.data && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('Швидкий вибір ознак')} - {featureSelection.data.model_id}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {featureSelection.data.selected_features.map((item, idx) => (
              <MuiTooltip key={item.feature} title={`${t('Важливість')}: ${(item.importance ?? 0).toFixed(4)}`}>
                <Chip
                  label={`${idx + 1}. ${item.feature}`}
                  color={idx < 5 ? 'primary' : idx < 10 ? 'secondary' : 'default'}
                  size="small"
                />
              </MuiTooltip>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {t('Всього ознак')}: {featureSelection.data.total_features} | {t('Метод')}: {featureSelection.data.method}
          </Typography>
        </Paper>
      )}

      {/* Full Analysis Results */}
      {featureAnalysis.data && !featureAnalysis.isLoading && (
        <Stack spacing={3}>
          {/* Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Рекомендовані ознаки')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {featureAnalysis.data.recommended_features.map((feature, idx) => (
                  <Chip
                    key={feature}
                    label={`${idx + 1}. ${feature}`}
                    color={idx < 5 ? 'success' : 'default'}
                    size="small"
                  />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Всього ознак')}: {featureAnalysis.data.metadata.n_features_total} |{' '}
                {t('Вибрано')}: {featureAnalysis.data.metadata.n_features_selected}
              </Typography>
            </CardContent>
          </Card>

          {/* Mutual Information */}
          {mutualInfoData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Mutual Information Scores')}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mutualInfoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="feature" width={150} />
                  <Tooltip formatter={(value: number) => (value ?? 0).toFixed(4)} />
                  <Legend />
                  <Bar dataKey="score" name={t('MI Score')}>
                    {mutualInfoData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Mutual Information показує нелінійну залежність між ознакою та цільовою змінною.')}
              </Typography>
            </Paper>
          )}

          {/* Permutation Importance */}
          {permutationData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Permutation Importance')}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={permutationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="feature" width={150} />
                  <Tooltip formatter={(value: number) => (value ?? 0).toFixed(4)} />
                  <Legend />
                  <Bar dataKey="importance" name={t('Importance')} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Permutation Importance показує зниження якості моделі при перемішуванні значень ознаки.')}
              </Typography>
            </Paper>
          )}

          {/* Correlation Analysis */}
          {featureAnalysis.data.correlation_analysis && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Кореляційний аналіз')}
              </Typography>

              <Grid container spacing={2}>
                {/* Target Correlations */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Кореляція з цільовою змінною')}
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Ознака')}</TableCell>
                          <TableCell align="right">{t('Кореляція')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(featureAnalysis.data.correlation_analysis.target_correlation)
                          .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                          .slice(0, 15)
                          .map(([feature, corr]) => (
                            <TableRow key={feature}>
                              <TableCell>{feature}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={(corr ?? 0).toFixed(3)}
                                  size="small"
                                  color={
                                    Math.abs(corr ?? 0) > 0.7
                                      ? 'success'
                                      : Math.abs(corr ?? 0) > 0.4
                                        ? 'info'
                                        : 'default'
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* High Correlation Pairs */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Висококорельовані пари ознак')}
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Пара')}</TableCell>
                          <TableCell align="right">{t('Кореляція')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {featureAnalysis.data.correlation_analysis.high_correlation_pairs
                          .slice(0, 15)
                          .map((pair, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Typography variant="caption">
                                  {pair.feature1} ↔ {pair.feature2}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={(pair.correlation ?? 0).toFixed(3)}
                                  size="small"
                                  color={(pair.correlation ?? 0) > 0.9 ? 'error' : 'warning'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="caption" color="text.secondary">
                    {t('Висока кореляція між ознаками може вказувати на мультиколінеарність.')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* VIF Analysis */}
          {vifData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Variance Inflation Factor (VIF)')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Ознака')}</TableCell>
                      <TableCell align="right">VIF</TableCell>
                      <TableCell align="center">{t('Статус')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vifData.slice(0, 20).map((item) => (
                      <TableRow key={item.feature}>
                        <TableCell>{item.feature}</TableCell>
                        <TableCell align="right">{(item.vif ?? 0).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              item.status === 'high'
                                ? t('Висока мультиколінеарність')
                                : item.status === 'medium'
                                  ? t('Середня')
                                  : t('Низька')
                            }
                            size="small"
                            color={item.status === 'high' ? 'error' : item.status === 'medium' ? 'warning' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                VIF &gt; 10: {t('серйозна мультиколінеарність')} | VIF &gt; 5: {t('помірна мультиколінеарність')} | VIF &lt; 5: {t('прийнятно')}
              </Typography>
            </Paper>
          )}

          {/* RFE Results */}
          {featureAnalysis.data.rfe_results && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Recursive Feature Elimination (RFE)')}
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Вибрані ознаки')}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {featureAnalysis.data.rfe_results.selected_features.map((feature, idx) => (
                      <Chip key={feature} label={`${idx + 1}. ${feature}`} color="primary" size="small" />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Ранкінг ознак')}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {Object.entries(featureAnalysis.data.rfe_results.ranking)
                      .sort(([, a], [, b]) => a - b)
                      .slice(0, 20)
                      .map(([feature, rank]) => (
                        <Chip
                          key={feature}
                          label={`${feature}: ${rank}`}
                          size="small"
                          variant={rank === 1 ? 'filled' : 'outlined'}
                          color={rank === 1 ? 'success' : 'default'}
                        />
                      ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Base64 Plot */}
          {featureAnalysis.data.plots?.importance && (
            <Base64Image
              data={featureAnalysis.data.plots.importance}
              alt="Feature Importance Plot"
              title={t('Графік важливості ознак')}
            />
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Mutual Info</strong>: {t('Нелінійна залежність')} |{' '}
              <strong>Permutation</strong>: {t('Вплив на якість моделі')} |{' '}
              <strong>VIF</strong>: {t('Мультиколінеарність')} |{' '}
              <strong>RFE</strong>: {t('Рекурсивний вибір')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!featureAnalysis.data && !featureAnalysis.isLoading && !featureAnalysis.error && !featureSelection.data && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Виберіть модель та запустіть аналіз для перегляду результатів')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
