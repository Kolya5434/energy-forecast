import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

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
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { useApi } from '../context/useApi.tsx';
import { exportChartData } from '../helpers/exportToFile.ts';
import { isFeatureImportanceResponse } from '../helpers/utils.ts';
import { CHART_MARGIN, TOOLTIP_STYLE } from '../shared/constans.ts';
import type { ChartType, ViewMode } from '../types/shared.ts';
import { ChartTypeSelector } from './ChartTypeSelector.tsx';
import classes from './InterpretContent.module.scss';
import { TopSelect } from './TopSelect.tsx';

export const InterpretContent = () => {
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

  const renderBarChart = useCallback(
    (layout: 'horizontal' | 'vertical' = 'horizontal') => {
      const isVertical = layout === 'vertical';

      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={CHART_MARGIN} layout={isVertical ? 'vertical' : undefined}>
            <CartesianGrid strokeDasharray="3 3" />
            {isVertical ? (
              <>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} interval={0} tick={{ fontSize: 11 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Важливість', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
              </>
            )}
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="value" name="Важливість ознаки" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    },
    [chartData]
  );

  const renderLineChart = useCallback(() => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
          <YAxis label={{ value: 'Важливість', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line type="monotone" dataKey="value" name="Важливість ознаки" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [chartData]);

  const renderScatterChart = useCallback(() => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
          <YAxis label={{ value: 'Важливість', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Scatter name="Важливість ознаки" dataKey="value" fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }, [chartData]);

  const renderRadarChart = useCallback(() => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Radar name="Важливість ознаки" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }, [chartData]);

  const renderChart = useMemo(() => {
    if (chartData.length === 0) return null;

    switch (chartType) {
      case 'bar':
        return renderBarChart('horizontal');
      case 'vertical-bar':
        return renderBarChart('vertical');
      case 'line':
      case 'smooth-line':
        return renderLineChart();
      case 'scatter':
        return renderScatterChart();
      case 'radar':
        return renderRadarChart();
      default:
        return renderBarChart('horizontal');
    }
  }, [chartType, chartData, renderBarChart, renderLineChart, renderScatterChart, renderRadarChart]);

  const renderTable = useCallback(() => {
    return (
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>№</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Назва ознаки</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Важливість
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Відносна важливість (%)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.map((row, index) => {
              const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
              const percentage = ((row.value / totalValue) * 100).toFixed(2);

              return (
                <TableRow key={row.name} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.value.toFixed(4)}</TableCell>
                  <TableCell align="right">{percentage}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [chartData]);

  const renderContent = () => {
    if (isLoadingInterpretation) {
      return <Skeleton variant="rectangular" width="100%" height={400} />;
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
            Отримано дані інтерпретації в непідтримуваному форматі.
          </Typography>
        );
      }
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Дані інтерпретації недоступні для цієї моделі.
        </Typography>
      );
    }

    return viewMode === 'chart' ? renderChart : renderTable();
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Аналіз важливості ознак</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportChartData('xlsx', chartData, selectedModel)}
              disabled={chartData.length === 0}
            >
              Excel
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportChartData('docx', chartData, selectedModel)}
              disabled={chartData.length === 0}
            >
              Word
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportChartData('pdf', chartData, selectedModel)}
              disabled={chartData.length === 0}
            >
              PDF
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'space-between' }}>
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

          <div className={classes.interpretContentSelects}>
            <TopSelect value={topN} onChange={setTopN} />

            {viewMode === 'chart' && (
              <ChartTypeSelector
                value={chartType}
                onChange={setChartType}
                label="Тип візуалізації"
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
                Графік
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableChartIcon fontSize="small" sx={{ mr: 0.5 }} />
                Таблиця
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Stack>

        {renderContent()}
      </Paper>
    </Box>
  );
};
