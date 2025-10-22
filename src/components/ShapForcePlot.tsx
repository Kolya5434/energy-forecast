import { useEffect, useMemo, useState } from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { useApi } from '../context/useApi.tsx';

export const ShapForcePlot = () => {
  const { models, isLoadingModels, interpretations, getInterpretation } = useApi();
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost_Tuned');

  useEffect(() => {
    if (selectedModel) {
      getInterpretation(selectedModel);
    }
  }, [selectedModel, getInterpretation]);

  const shapData = useMemo(() => {
    const interpretationData = interpretations[selectedModel];
    if (interpretationData && 'shap_values' in interpretationData) {
      return interpretationData.shap_values;
    }
    return null;
  }, [interpretations, selectedModel]);

  const sortedContributions = useMemo(() => {
    if (!shapData?.feature_contributions) {
      return { positive: [], negative: [] };
    }

    const positive: Array<{ name: string; value: number }> = [];
    const negative: Array<{ name: string; value: number }> = [];

    Object.entries(shapData.feature_contributions).forEach(([name, value]) => {
      if (value > 0) {
        positive.push({ name, value });
      } else if (value < 0) {
        negative.push({ name, value });
      }
    });

    positive.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    negative.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    return { positive, negative };
  }, [shapData]);

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value as string);
  };
  
  if (!shapData) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          SHAP Force Plot - Аналіз впливу ознак на прогноз
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Завантаження даних...</Typography>
        </Box>
      </Paper>
    );
  }

  const { base_value, prediction_value, feature_contributions } = shapData;

  if (!feature_contributions) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          SHAP Force Plot - Аналіз впливу ознак на прогноз
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Дані про внески ознак недоступні</Typography>
        </Box>
      </Paper>
    );
  }

  const totalChange = prediction_value - base_value;
  const maxAbsValue = Math.max(...Object.values(feature_contributions).map(Math.abs));

  const getArrowWidth = (value: number) => {
    const percentage = (Math.abs(value) / maxAbsValue) * 100;
    return Math.max(percentage, 15);
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          SHAP Force Plot - Аналіз впливу ознак на прогноз
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`Базове значення: ${formatNumber(base_value)}`} variant="outlined" size="small" />
          <Chip label={`Прогноз: ${formatNumber(prediction_value)}`} color="primary" size="small" />
          <Chip
            label={`Загальна зміна: ${formatNumber(totalChange)}`}
            color={totalChange >= 0 ? 'success' : 'error'}
            size="small"
            icon={totalChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          />
          <FormControl size="small" sx={{ maxWidth: 240, flexGrow: 1 }}>
            <InputLabel id="model-select-label">Модель для аналізу</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label="Модель для аналізу"
              onChange={handleModelChange}
              disabled={isLoadingModels}
            >
              {models &&
                Object.keys(models)
                  .filter((id) => models[id].type === 'ml')
                  .map((modelId) => (
                    <MenuItem key={modelId} value={modelId}>
                      {modelId}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Stack>

        <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 400px)',  overflowY: 'auto', overflowX: 'hidden', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                backgroundColor: '#ccc',
                transform: 'translateY(-50%)'
              }
            }}
          >
            <Box
              sx={{
                backgroundColor: '#e3f2fd',
                border: '2px solid #1976d2',
                borderRadius: 2,
                p: 2,
                zIndex: 1,
                textAlign: 'center',
                minWidth: 120
              }}
            >
              <Typography variant="caption" color="black">
                Базове значення
              </Typography>
              <Typography variant="h6" color="primary">
                {formatNumber(base_value)}
              </Typography>
            </Box>

            <ArrowForwardIcon sx={{ fontSize: 40, color: '#666', zIndex: 1 }} />

            <Box
              sx={{
                backgroundColor: totalChange >= 0 ? '#e8f5e9' : '#ffebee',
                border: `2px solid ${totalChange >= 0 ? '#4caf50' : '#f44336'}`,
                borderRadius: 2,
                p: 2,
                zIndex: 1,
                textAlign: 'center',
                minWidth: 120
              }}
            >
              <Typography variant="caption" color="black">
                Прогноз
              </Typography>
              <Typography variant="h6" color={totalChange >= 0 ? 'success.main' : 'error.main'}>
                {formatNumber(prediction_value)}
              </Typography>
            </Box>
          </Box>

          {sortedContributions.positive.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Позитивні внески (збільшують прогноз):
              </Typography>
              <Stack spacing={1}>
                {sortedContributions.positive.map((contrib) => (
                  <Tooltip key={contrib.name} title={`${contrib.name}: +${formatNumber(contrib.value)}`} arrow>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                        {contrib.name}
                      </Typography>
                      <Box
                        sx={{
                          width: `${getArrowWidth(contrib.value)}%`,
                          height: 30,
                          backgroundColor: '#ff5252',
                          borderRadius: '0 15px 15px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          px: 1,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: -10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0,
                            height: 0,
                            borderTop: '15px solid transparent',
                            borderBottom: '15px solid transparent',
                            borderLeft: '10px solid #ff5252'
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                          +{formatNumber(contrib.value)}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          )}

          {sortedContributions.negative.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Негативні внески (зменшують прогноз):
              </Typography>
              <Stack spacing={1}>
                {sortedContributions.negative.map((contrib) => (
                  <Tooltip key={contrib.name} title={`${contrib.name}: ${formatNumber(contrib.value)}`} arrow>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(-4px)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: `${getArrowWidth(contrib.value)}%`,
                          height: 30,
                          backgroundColor: '#2196f3',
                          borderRadius: '15px 0 0 15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          px: 1,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0,
                            height: 0,
                            borderTop: '15px solid transparent',
                            borderBottom: '15px solid transparent',
                            borderRight: '10px solid #2196f3'
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {formatNumber(contrib.value)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                        {contrib.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          )}

          {sortedContributions.positive.length === 0 && sortedContributions.negative.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Немає значущих внесків ознак у цей прогноз</Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            <strong>Інтерпретація:</strong>
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              • <span style={{ color: '#ff5252' }}>Червоні стрілки</span> - ознаки, що збільшують прогноз
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • <span style={{ color: '#2196f3' }}>Сині стрілки</span> - ознаки, що зменшують прогноз
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Довжина стрілки показує силу впливу ознаки
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};
