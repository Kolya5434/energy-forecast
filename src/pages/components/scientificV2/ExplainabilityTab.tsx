import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PsychologyIcon from '@mui/icons-material/Psychology';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useExplainability, usePartialDependence } from '@/hooks/useScientificV2';
import { Base64Image, ModelSelector } from './shared';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d084d0'];

export const ExplainabilityTab = memo(function ExplainabilityTab() {
  const { t } = useTranslation();
  const explainability = useExplainability();
  const partialDependence = usePartialDependence();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [analysisTypes, setAnalysisTypes] = useState<('pdp' | 'ice' | 'ale')[]>(['pdp', 'ice']);
  const [nSamples, setNSamples] = useState<number>(100);
  const [activeResultTab, setActiveResultTab] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const handleRun = () => {
    if (!selectedModel || analysisTypes.length === 0) return;
    explainability.execute({
      model_id: selectedModel,
      analysis_types: analysisTypes,
      n_samples: nSamples
    });
  };

  const handleQuickPDP = (feature: string) => {
    if (!selectedModel) return;
    setSelectedFeature(feature);
    partialDependence.execute(selectedModel, feature);
  };

  // Available features from results
  const availableFeatures = useMemo(() => {
    if (!explainability.data) return [];
    const features = new Set<string>();

    if (explainability.data.pdp_results) {
      Object.keys(explainability.data.pdp_results).forEach((f) => features.add(f));
    }
    if (explainability.data.ice_results) {
      Object.keys(explainability.data.ice_results).forEach((f) => features.add(f));
    }
    if (explainability.data.ale_results) {
      Object.keys(explainability.data.ale_results).forEach((f) => features.add(f));
    }

    return Array.from(features);
  }, [explainability.data]);

  // Prepare PDP chart data for a specific feature
  const getPdpChartData = (feature: string) => {
    if (!explainability.data?.pdp_results?.[feature]) return [];

    const { feature_values, partial_dependence } = explainability.data.pdp_results[feature];
    return feature_values.map((value, index) => ({
      featureValue: value,
      pdp: partial_dependence[index]
    }));
  };

  // Prepare ICE chart data for a specific feature
  const getIceChartData = (feature: string) => {
    if (!explainability.data?.ice_results?.[feature]) return [];

    const { feature_values, ice_curves } = explainability.data.ice_results[feature];
    return feature_values.map((value, index) => {
      const point: Record<string, number> = { featureValue: value };
      ice_curves.forEach((curve, curveIdx) => {
        point[`curve_${curveIdx}`] = curve[index] ?? 0;
      });
      return point;
    });
  };

  // Prepare ALE chart data for a specific feature
  const getAleChartData = (feature: string) => {
    if (!explainability.data?.ale_results?.[feature]) return [];

    const { feature_values, ale_values } = explainability.data.ale_results[feature];
    return feature_values.map((value, index) => ({
      featureValue: value,
      ale: ale_values[index]
    }));
  };

  // Quick PDP chart data
  const quickPdpData = useMemo(() => {
    if (!partialDependence.data) return [];

    return partialDependence.data.feature_values.map((value, index) => ({
      featureValue: value,
      pdp: partialDependence.data!.partial_dependence[index]
    }));
  }, [partialDependence.data]);

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('Пояснюваність моделі (XAI)')}
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
              {t('Кількість семплів')}: {nSamples}
            </Typography>
            <Slider
              value={nSamples}
              onChange={(_, v) => setNSamples(v as number)}
              min={10}
              max={500}
              step={10}
              marks={[
                { value: 10, label: '10' },
                { value: 100, label: '100' },
                { value: 250, label: '250' },
                { value: 500, label: '500' }
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
              <ToggleButton value="pdp">PDP (Partial Dependence)</ToggleButton>
              <ToggleButton value="ice">ICE (Individual Conditional)</ToggleButton>
              <ToggleButton value="ale">ALE (Accumulated Local)</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={!selectedModel || analysisTypes.length === 0 || explainability.isLoading}
              fullWidth
            >
              {t('Запустити аналіз')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {explainability.isLoading && <LoadingFallback />}

      {/* Error */}
      {explainability.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {explainability.error}
        </Alert>
      )}

      {/* Results */}
      {explainability.data && !explainability.isLoading && (
        <Stack spacing={3}>
          {/* Metadata */}
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Chip label={`${t('Модель')}: ${explainability.data.model_id}`} color="primary" />
                <Chip label={`${t('Семплів')}: ${explainability.data.metadata.n_samples}`} />
                <Chip label={`${t('Ознак')}: ${explainability.data.metadata.features_analyzed.length}`} />
                <Chip label={`${t('Типи')}: ${explainability.data.metadata.analysis_types.join(', ')}`} />
              </Stack>
            </CardContent>
          </Card>

          {/* Feature Selector for Charts */}
          {availableFeatures.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>{t('Виберіть ознаку для візуалізації')}</InputLabel>
              <Select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                label={t('Виберіть ознаку для візуалізації')}
              >
                {availableFeatures.map((feature) => (
                  <MenuItem key={feature} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Analysis Results Tabs */}
          {selectedFeature && (
            <>
              <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeResultTab} onChange={(_, v) => setActiveResultTab(v)}>
                  {analysisTypes.includes('pdp') && <Tab label="PDP" />}
                  {analysisTypes.includes('ice') && <Tab label="ICE" />}
                  {analysisTypes.includes('ale') && <Tab label="ALE" />}
                </Tabs>
              </Paper>

              {/* PDP Chart */}
              {analysisTypes.includes('pdp') &&
                activeResultTab === 0 &&
                explainability.data.pdp_results?.[selectedFeature] && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Partial Dependence Plot - {selectedFeature}
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={getPdpChartData(selectedFeature)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="featureValue" label={{ value: selectedFeature, position: 'bottom' }} />
                        <YAxis label={{ value: t('Середній прогноз'), angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pdp"
                          stroke="#1976d2"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name={t('Partial Dependence')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('PDP показує середній вплив ознаки на прогноз, усереднений по всіх інших ознаках.')}
                    </Typography>
                  </Paper>
                )}

              {/* ICE Chart */}
              {analysisTypes.includes('ice') &&
                ((analysisTypes.includes('pdp') && activeResultTab === 1) ||
                  (!analysisTypes.includes('pdp') && activeResultTab === 0)) &&
                explainability.data.ice_results?.[selectedFeature] && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Individual Conditional Expectation - {selectedFeature}
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={getIceChartData(selectedFeature)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="featureValue" label={{ value: selectedFeature, position: 'bottom' }} />
                        <YAxis label={{ value: t('Прогноз'), angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        {explainability.data.ice_results[selectedFeature].ice_curves.slice(0, 20).map((_, idx) => (
                          <Line
                            key={idx}
                            type="monotone"
                            dataKey={`curve_${idx}`}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            strokeWidth={1}
                            strokeOpacity={0.5}
                            dot={false}
                            name={`${t('Семпл')} ${idx + 1}`}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('ICE показує індивідуальний вплив ознаки для кожного семплу окремо.')}
                    </Typography>
                  </Paper>
                )}

              {/* ALE Chart */}
              {analysisTypes.includes('ale') &&
                activeResultTab === analysisTypes.filter((t) => t !== 'ale').length &&
                explainability.data.ale_results?.[selectedFeature] && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Accumulated Local Effects - {selectedFeature}
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={getAleChartData(selectedFeature)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="featureValue" label={{ value: selectedFeature, position: 'bottom' }} />
                        <YAxis label={{ value: t('ALE'), angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="ale"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name={t('ALE')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('ALE показує локальний вплив ознаки, враховуючи кореляції між ознаками.')}
                    </Typography>
                  </Paper>
                )}
            </>
          )}

          {/* Feature Interactions */}
          {explainability.data.feature_interactions &&
            Object.keys(explainability.data.feature_interactions).length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('Взаємодії між ознаками')}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {Object.entries(explainability.data.feature_interactions).map(([pair, interaction]) => (
                    <Chip
                      key={pair}
                      label={`${pair}: ${interaction.correlation.toFixed(2)} (${interaction.interaction_strength})`}
                      size="small"
                      color={
                        interaction.interaction_strength === 'high'
                          ? 'error'
                          : interaction.interaction_strength === 'medium'
                            ? 'warning'
                            : 'success'
                      }
                    />
                  ))}
                </Stack>
              </Paper>
            )}

          {/* Base64 Plot */}
          {explainability.data.plots?.pdp && (
            <Base64Image
              data={explainability.data.plots.pdp}
              alt="PDP Plot"
              title={t('Partial Dependence Plot (всі ознаки)')}
            />
          )}

          {/* Quick Feature Analysis */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Швидкий аналіз ознаки')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableFeatures.slice(0, 10).map((feature) => (
                <Button
                  key={feature}
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickPDP(feature)}
                  disabled={partialDependence.isLoading}
                >
                  {feature}
                </Button>
              ))}
            </Stack>

            {partialDependence.isLoading && <LoadingFallback />}

            {partialDependence.data && quickPdpData.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  PDP для {partialDependence.data.feature}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={quickPdpData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="featureValue" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pdp" stroke="#1976d2" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('Статистика ознаки')}
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Min:
                            </Typography>
                            <Typography variant="body2">
                              {partialDependence.data.feature_stats.min.toFixed(4)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Max:
                            </Typography>
                            <Typography variant="body2">
                              {partialDependence.data.feature_stats.max.toFixed(4)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Mean:
                            </Typography>
                            <Typography variant="body2">
                              {partialDependence.data.feature_stats.mean.toFixed(4)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Std:
                            </Typography>
                            <Typography variant="body2">
                              {partialDependence.data.feature_stats.std.toFixed(4)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>PDP</strong>: {t('Показує середній ефект ознаки на прогноз')} | <strong>ICE</strong>:{' '}
              {t('Показує ефект для кожного спостереження')} | <strong>ALE</strong>:{' '}
              {t('Враховує кореляції між ознаками')}
            </Typography>
          </Alert>
        </Stack>
      )}

      {/* Empty State */}
      {!explainability.data && !explainability.isLoading && !explainability.error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Виберіть модель та запустіть аналіз для перегляду результатів')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
});
