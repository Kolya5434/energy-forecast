import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DownloadIcon from '@mui/icons-material/Download';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi.tsx';
import { exportChartData } from '@/helpers/exportToFile.ts';
import { preloadDocx, preloadJspdf, preloadXlsx } from '@/helpers/preloadExportLibs';
import { isFeatureImportanceResponse } from '@/helpers/utils.ts';
import type { ChartType, ViewMode } from '@/types/shared.ts';
import { ChartTypeSelector } from './ChartTypeSelector.tsx';
import { FeatureImportanceChart } from './components/interpretation/FeatureImportanceChart';
import { FeatureImportanceTable } from './components/interpretation/FeatureImportanceTable';
import classes from './InterpretContent.module.scss';
import { TopSelect } from './TopSelect.tsx';

export const InterpretContent = () => {
  const { t } = useTranslation();
  const { models, isLoadingModels, getInterpretation, interpretations, isLoadingInterpretation, interpretationError } =
    useApi();
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost_Tuned');
  const [topN, setTopN] = useState<number>(15);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');

  useEffect(() => {
    if (selectedModel) {
      getInterpretation(selectedModel);
    }
  }, [selectedModel, getInterpretation]);

  const chartData = useMemo(() => {
    const interpretationData = interpretations[selectedModel];
    if (isFeatureImportanceResponse(interpretationData)) {
      const { feature_importance } = interpretationData;
      return Object.entries(feature_importance)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, topN);
    }
    return [];
  }, [interpretations, selectedModel, topN]);

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value as string);
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const renderContent = () => {
    if (isLoadingInterpretation) {
      return <LoadingFallback />;
    }
    if (interpretationError) {
      return (
        <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
          {interpretationError}
        </Typography>
      );
    }
    if (chartData.length === 0) {
      if (interpretations[selectedModel] && !isFeatureImportanceResponse(interpretations[selectedModel])) {
        return (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            {t('Отримано дані інтерпретації в непідтримуваному форматі.')}
          </Typography>
        );
      }
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('Дані інтерпретації недоступні для цієї моделі.')}
        </Typography>
      );
    }

    return viewMode === 'chart' ? (
      <FeatureImportanceChart chartData={chartData} chartType={chartType} />
    ) : (
      <FeatureImportanceTable chartData={chartData} />
    );
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5">{t('Аналіз важливості ознак')}</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportChartData('xlsx', chartData, selectedModel)}
              onMouseEnter={preloadXlsx}
              onFocus={preloadXlsx}
              disabled={chartData.length === 0}
            >
              Excel
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportChartData('docx', chartData, selectedModel)}
              onMouseEnter={preloadDocx}
              onFocus={preloadDocx}
              disabled={chartData.length === 0}
            >
              Word
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportChartData('pdf', chartData, selectedModel)}
              onMouseEnter={preloadJspdf}
              onFocus={preloadJspdf}
              disabled={chartData.length === 0}
            >
              PDF
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ maxWidth: 240, flexGrow: 1, minWidth: 200 }}>
            <InputLabel id="model-select-label">{t('Модель для аналізу')}</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label={t('Модель для аналізу')}
              onChange={handleModelChange}
              disabled={isLoadingModels}
            >
              {models &&
                Object.keys(models)
                  .filter((id) => models[id]?.type === 'ml')
                  .map((modelId) => (
                    <MenuItem key={modelId} value={modelId}>
                      {modelId}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>

          <div className={classes.interpretContentSelects}>
            <TopSelect value={topN} onChange={setTopN} />

            {viewMode === 'chart' && (
              <ChartTypeSelector
                value={chartType}
                onChange={setChartType}
                label={t('Тип візуалізації')}
                minWidth={200}
                excludeTypes={['area', 'stacked-area', 'stacked-bar', 'step', 'composed', 'heatmap']}
              />
            )}

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              aria-label="view mode"
            >
              <ToggleButton value="chart" aria-label="chart view">
                <ShowChartIcon fontSize="small" sx={{ mr: 0.5 }} />
                {t('Графік')}
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableChartIcon fontSize="small" sx={{ mr: 0.5 }} />
                {t('Таблиця')}
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Stack>

        {renderContent()}
      </Paper>
    </Box>
  );
};
