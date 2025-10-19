import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select,
  type SelectChangeEvent, Skeleton, Stack, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useApi } from '../context/useApi.tsx';
import type { ChartType, IChartDataPoint } from '../types/shared.ts';
import { COLORS } from '../shared/constans.ts';
import { getHeatmapColor } from '../helpers/utils.ts';

export const MainContent = () => {
  const { predictions, isLoadingPredictions, clearPredictions } = useApi();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  
  
  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType);
  };
  
  // Initialize selected models when prediction load
  useMemo(() => {
    if (predictions && selectedModels.length === 0) {
      setSelectedModels(predictions.map(p => p.model_id));
    }
  }, [predictions]);
  
  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (predictions) {
      setSelectedModels(predictions.map(p => p.model_id));
    }
  };
  
  const handleClearData = () => {
    if (clearPredictions) {
      clearPredictions();
      setSelectedModels([]);
      setChartType('line');
    }
  };
  
  // Filter predictions based on selected models
  const filteredPredictions = useMemo(() => {
    if (!predictions) return null;
    return predictions.filter(p => selectedModels.includes(p.model_id));
  }, [predictions, selectedModels]);
  
  // We use useMemo to transform the data only when the predictions change.
  // This is a performance optimization.
  const chartData = useMemo(() => {
    if (!filteredPredictions) return [];
    
    // The data from the API is a list of predictions for each model.
    // We need to merge them into a single array for the chart.
    // E.g., from [{model:'A', forecast:{'d1':1}}, {model:'B', forecast:{'d1':2}}]
    // To -> [{date: 'd1', 'A': 1, 'B': 2}]
    
    const dataMap: { [date: string]: IChartDataPoint } = {};
    
    filteredPredictions.forEach((prediction) => {
      const { model_id, forecast } = prediction;
      Object.entries(forecast).forEach(([date, value]) => {
        if (!dataMap[date]) {
          dataMap[date] = { date };
        }
        dataMap[date][model_id] = value;
      });
    });
    
    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredPredictions]);
  
  // Heatmap data transformation
  const heatmapData = useMemo(() => {
    if (!filteredPredictions || chartData.length === 0) return { data: [], min: 0, max: 0 };
    
    const modelIds = filteredPredictions.map(p => p.model_id);
    const allValues: number[] = [];
    
    chartData.forEach(point => {
      modelIds.forEach(modelId => {
        const value = point[modelId];
        if (typeof value === 'number') {
          allValues.push(value);
        }
      });
    });
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    return { data: chartData, min, max, modelIds };
  }, [filteredPredictions, chartData]);
  
  const getModelColor = (modelId: string) => {
    const index = predictions?.findIndex(p => p.model_id === modelId) ?? 0;
    return COLORS[index % COLORS.length];
  };
  
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: {
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }
    };
    
    const tooltipStyle = {
      backgroundColor: 'rgba(30, 30, 30, 0.8)',
      border: 'none',
      borderRadius: '8px'
    };
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Bar key={p.model_id} dataKey={p.model_id} fill={getModelColor(p.model_id)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'vertical-bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="date" type="category" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Bar key={p.model_id} dataKey={p.model_id} fill={getModelColor(p.model_id)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'stacked-bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Bar
                  key={p.model_id}
                  dataKey={p.model_id}
                  fill={getModelColor(p.model_id)}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => {
                const color = getModelColor(p.model_id);
                return (
                  <Area
                    key={p.model_id}
                    type="monotone"
                    dataKey={p.model_id}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'stacked-area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => {
                const color = getModelColor(p.model_id);
                return (
                  <Area
                    key={p.model_id}
                    type="monotone"
                    dataKey={p.model_id}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.6}
                    strokeWidth={2}
                    stackId="1"
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'step':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Line
                  key={p.model_id}
                  type="step"
                  dataKey={p.model_id}
                  stroke={getModelColor(p.model_id)}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'smooth-line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Line
                  key={p.model_id}
                  type="natural"
                  dataKey={p.model_id}
                  stroke={getModelColor(p.model_id)}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p, index) => {
                const color = getModelColor(p.model_id);
                if (index % 2 === 0) {
                  return <Line key={p.model_id} type="monotone" dataKey={p.model_id} stroke={color} strokeWidth={2} />;
                } else {
                  return <Bar key={p.model_id} dataKey={p.model_id} fill={color} />;
                }
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Scatter
                  key={p.model_id}
                  name={p.model_id}
                  dataKey={p.model_id}
                  fill={getModelColor(p.model_id)}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="date" />
              <PolarRadiusAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Radar
                  key={p.model_id}
                  name={p.model_id}
                  dataKey={p.model_id}
                  stroke={getModelColor(p.model_id)}
                  fill={getModelColor(p.model_id)}
                  fillOpacity={0.3}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'heatmap':
        { const { data, min, max, modelIds } = heatmapData;
        const cellWidth = 100 / (data.length || 1);
        const cellHeight = 100 / (modelIds?.length || 1);
        
        return (
          <Box sx={{ width: '100%', height: '100%', position: 'relative', overflowX: 'auto' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {modelIds?.map((modelId, rowIndex) => (
                data.map((point, colIndex) => {
                  const value = point[modelId];
                  if (typeof value !== 'number') return null;
                  
                  return (
                    <rect
                      key={`${modelId}-${colIndex}`}
                      x={colIndex * cellWidth}
                      y={rowIndex * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                      fill={getHeatmapColor(value, min, max)}
                      stroke="#fff"
                      strokeWidth="0.1"
                    >
                      <title>{`${modelId}: ${value.toFixed(2)} (${point.date})`}</title>
                    </rect>
                  );
                })
              ))}
            </svg>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 2 }}>
              <Typography variant="caption">Dates: {data[0]?.date} - {data[data.length - 1]?.date}</Typography>
              <Typography variant="caption">Models: {modelIds?.join(', ')}</Typography>
            </Box>
          </Box>
        ); }
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {filteredPredictions?.map((p) => (
                <Line
                  key={p.model_id}
                  type="monotone"
                  dataKey={p.model_id}
                  stroke={getModelColor(p.model_id)}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          height: '100%',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Графік Прогнозів</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {predictions && predictions.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleClearData}
              >
                Очистити дані
              </Button>
            )}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="chart-type-label">Тип діаграми</InputLabel>
              <Select
                labelId="chart-type-label"
                id="chart-type-select"
                value={chartType}
                label="Тип діаграми"
                onChange={handleChartTypeChange}
              >
                <MenuItem value="line">Лінійна</MenuItem>
                <MenuItem value="smooth-line">Лінійна (згладжена)</MenuItem>
                <MenuItem value="step">Ступінчаста</MenuItem>
                <MenuItem value="area">Area</MenuItem>
                <MenuItem value="stacked-area">Area (стек)</MenuItem>
                <MenuItem value="bar">Стовпчаста</MenuItem>
                <MenuItem value="vertical-bar">Стовпчаста (горизонтальна)</MenuItem>
                <MenuItem value="stacked-bar">Стовпчаста (стек)</MenuItem>
                <MenuItem value="composed">Комбінована</MenuItem>
                <MenuItem value="scatter">Точкова</MenuItem>
                <MenuItem value="radar">Радарна</MenuItem>
                <MenuItem value="heatmap">Теплова карта</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {predictions && predictions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Моделі:
              </Typography>
              <Chip
                label="Всі"
                size="small"
                onClick={handleSelectAll}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
                defaultChecked={true}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {predictions.map((p) => {
                  const isSelected = selectedModels.includes(p.model_id);
                  const color = getModelColor(p.model_id);
                  
                  return (
                    <Chip
                      key={p.model_id}
                      label={p.model_id}
                      onClick={() => handleModelToggle(p.model_id)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{
                        borderColor: isSelected ? color : undefined,
                        backgroundColor: isSelected ? color : undefined,
                        '&:hover': {
                          backgroundColor: isSelected ? color : undefined,
                          opacity: 0.8,
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Box>
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          {isLoadingPredictions ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : !predictions || chartData.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                Виберіть моделі та натисніть "Сформувати прогноз", щоб побачити результат.
              </Typography>
            </Box>
          ) : (
            renderChart()
          )}
        </Box>
      </Paper>
    </Box>
  );
};