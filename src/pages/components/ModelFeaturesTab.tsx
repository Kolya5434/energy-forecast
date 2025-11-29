import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DataArrayIcon from '@mui/icons-material/DataArray';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { LoadingFallback } from '../../components/LoadingFallback';
import { useApi } from '../../context/useApi';
import type { IFeaturesResponse } from '../../types/api';

// Feature descriptions for tooltips
const FEATURE_DESCRIPTIONS: Record<string, string> = {
  // Time features
  hour: 'feature_desc_hour',
  day_of_week: 'feature_desc_day_of_week',
  day_of_month: 'feature_desc_day_of_month',
  day_of_year: 'feature_desc_day_of_year',
  week_of_year: 'feature_desc_week_of_year',
  month: 'feature_desc_month',
  quarter: 'feature_desc_quarter',
  year: 'feature_desc_year',
  is_weekend: 'feature_desc_is_weekend',
  is_holiday: 'feature_desc_is_holiday',

  // Energy features
  voltage: 'feature_desc_voltage',
  global_intensity: 'feature_desc_global_intensity',
  global_reactive_power: 'feature_desc_global_reactive_power',
  global_active_power: 'feature_desc_global_active_power',
  sub_metering_1: 'feature_desc_sub_metering_1',
  sub_metering_2: 'feature_desc_sub_metering_2',
  sub_metering_3: 'feature_desc_sub_metering_3',
  Sub_metering_1: 'feature_desc_sub_metering_1',
  Sub_metering_2: 'feature_desc_sub_metering_2',
  Sub_metering_3: 'feature_desc_sub_metering_3',

  // Weather features
  temperature: 'feature_desc_temperature',
  humidity: 'feature_desc_humidity',
  wind_speed: 'feature_desc_wind_speed',

  // Lag features
  lag_1: 'feature_desc_lag_1',
  lag_7: 'feature_desc_lag_7',
  lag_14: 'feature_desc_lag_14',
  lag_30: 'feature_desc_lag_30',

  // Rolling features
  rolling_mean_7: 'feature_desc_rolling_mean_7',
  rolling_std_7: 'feature_desc_rolling_std_7',
  rolling_mean_30: 'feature_desc_rolling_mean_30',
  rolling_std_30: 'feature_desc_rolling_std_30',

  // Other
  is_anomaly: 'feature_desc_is_anomaly',
  trend: 'feature_desc_trend',
  seasonality: 'feature_desc_seasonality'
};

export const ModelFeaturesTab = () => {
  const { t } = useTranslation();
  const { models, isLoadingModels, getFeatures, isLoadingFeatures, featuresError } = useApi();

  const getFeatureDescription = (feature: string): string => {
    const key = FEATURE_DESCRIPTIONS[feature];
    if (key) {
      return t(key);
    }
    // Handle lag_X pattern
    if (feature.startsWith('lag_')) {
      const days = feature.replace('lag_', '');
      return t('feature_desc_lag_generic', { days });
    }
    // Handle rolling patterns
    if (feature.startsWith('rolling_mean_')) {
      const days = feature.replace('rolling_mean_', '');
      return t('feature_desc_rolling_mean_generic', { days });
    }
    if (feature.startsWith('rolling_std_')) {
      const days = feature.replace('rolling_std_', '');
      return t('feature_desc_rolling_std_generic', { days });
    }
    return t('feature_desc_unknown');
  };

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [featuresData, setFeaturesData] = useState<IFeaturesResponse | null>(null);

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
    setFeaturesData(null);
  };

  useEffect(() => {
    if (selectedModel) {
      getFeatures(selectedModel).then((data) => {
        if (data) {
          setFeaturesData(data);
        }
      });
    }
  }, [selectedModel, getFeatures]);

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      classical: t('Класична'),
      ml: t('ML'),
      dl: t('Deep Learning'),
      ensemble: t('Ансамбль')
    };
    return typeMap[type] || type;
  };

  const getGranularityLabel = (granularity: string) => {
    const granMap: Record<string, string> = {
      daily: t('Денна'),
      hourly: t('Погодинна')
    };
    return granMap[granularity] || granularity;
  };

  const getFeatureSetLabel = (featureSet: string) => {
    const setMap: Record<string, string> = {
      none: t('Немає'),
      simple: t('Простий'),
      full: t('Повний'),
      base_scaled: t('Базовий масштабований')
    };
    return setMap[featureSet] || featureSet;
  };

  const getConditionCategoryLabel = (category: string) => {
    const catMap: Record<string, string> = {
      weather: t('Погодні умови'),
      calendar: t('Календарні умови'),
      time: t('Часовий сценарій'),
      energy: t('Енергетичні параметри'),
      zone_consumption: t('Споживання по зонах'),
      anomaly: t('Аномалія')
    };
    return catMap[category] || category;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Model selector */}
      <FormControl size="small" sx={{ minWidth: 250, mb: 3 }}>
        <InputLabel>{t('Модель для аналізу')}</InputLabel>
        <Select
          value={selectedModel}
          onChange={handleModelChange}
          label={t('Модель для аналізу')}
          disabled={isLoadingModels}
        >
          {models &&
            Object.keys(models).map((modelId) => (
              <MenuItem key={modelId} value={modelId}>
                {modelId}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Loading state */}
      {isLoadingFeatures && <LoadingFallback />}

      {/* Error state */}
      {featuresError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {featuresError}
        </Alert>
      )}

      {/* Empty state */}
      {!selectedModel && !isLoadingFeatures && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('Виберіть модель для перегляду інформації про ознаки')}
          </Typography>
        </Paper>
      )}

      {/* Features data */}
      {featuresData && !isLoadingFeatures && (
        <Stack spacing={3}>
          {/* Model Info Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Інформація про модель')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Tooltip title={t('model_info_type_desc')} arrow>
                  <Chip label={`${t('Тип')}: ${getTypeLabel(featuresData.type)}`} variant="outlined" />
                </Tooltip>
                <Tooltip title={t('model_info_granularity_desc')} arrow>
                  <Chip label={`${t('Гранулярність')}: ${getGranularityLabel(featuresData.granularity)}`} variant="outlined" />
                </Tooltip>
                <Tooltip title={t('model_info_feature_set_desc')} arrow>
                  <Chip label={`${t('Набір ознак')}: ${getFeatureSetLabel(featuresData.feature_set)}`} variant="outlined" />
                </Tooltip>
                <Tooltip title={t('model_info_supports_conditions_desc')} arrow>
                  <Chip
                    icon={featuresData.supports_conditions ? <CheckCircleIcon /> : <CancelIcon />}
                    label={t('Підтримка умов')}
                    color={featuresData.supports_conditions ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Tooltip>
              </Stack>

              {featuresData.note && (
                <Alert severity="info" icon={<InfoOutlinedIcon />}>
                  {featuresData.note}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Feature Names Card */}
          {featuresData.feature_names && featuresData.feature_names.length > 0 && (
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <DataArrayIcon color="primary" />
                  <Typography variant="h6">
                    {t('Ознаки моделі')} ({featuresData.feature_count || featuresData.feature_names.length})
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  {featuresData.feature_names.map((feature, index) => (
                    <Tooltip key={index} title={getFeatureDescription(feature)} arrow>
                      <Chip label={feature} size="small" variant="outlined" />
                    </Tooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Available Conditions Card */}
          {featuresData.available_conditions && Object.keys(featuresData.available_conditions).length > 0 && (
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <CategoryIcon color="primary" />
                  <Typography variant="h6">
                    {t('Доступні умови для прогнозування')}
                  </Typography>
                </Stack>
                <List dense>
                  {Object.entries(featuresData.available_conditions).map(([category, conditions], idx) => (
                    <Box key={category}>
                      {idx > 0 && <Divider sx={{ my: 1 }} />}
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" color="primary">
                              {getConditionCategoryLabel(category)}
                            </Typography>
                          }
                        />
                        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                          {conditions?.map((condition: string, cIdx: number) => (
                            <Tooltip key={cIdx} title={getFeatureDescription(condition)} arrow>
                              <Chip label={condition} size="small" />
                            </Tooltip>
                          ))}
                        </Stack>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Box>
  );
};
