import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import DownloadIcon from '@mui/icons-material/Download';
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
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { useApi } from '../context/useApi.tsx';
import { isFeatureImportanceResponse, handleExport } from '../helpers/utils.ts';

export const InterpretContent = () => {
  const { models, isLoadingModels, getInterpretation, interpretations, isLoadingInterpretation, interpretationError } =
    useApi();
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost_Tuned');
  const [topN, setTopN] = useState<number>(15);

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

  const handleTopNChange = (event: SelectChangeEvent) => {
    setTopN(Number(event.target.value));
  };

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

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 50, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
          <YAxis label={{ value: 'Важливість', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }} contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="value" name="Важливість ознаки" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Аналіз важливості ознак</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('xlsx')}>
              Excel
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')}>
              PDF
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('docx')}>
              Word
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
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

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="topn-select-label">Кількість ознак</InputLabel>
            <Select
              labelId="topn-select-label"
              value={topN.toString()}
              label="Кількість ознак"
              onChange={handleTopNChange}
            >
              <MenuItem value="10">Топ-10</MenuItem>
              <MenuItem value="15">Топ-15</MenuItem>
              <MenuItem value="20">Топ-20</MenuItem>
              <MenuItem value="30">Топ-30</MenuItem>
              <MenuItem value="999">Всі ознаки</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {renderContent()}
      </Paper>
    </Box>
  );
};
