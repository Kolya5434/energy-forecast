import { useState } from 'react';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';

import { useApi } from '../context/useApi.tsx';

interface SidePanelProps {
  togglePanel: () => void;
  isOpen: boolean;
}

const SidePanel = ({ togglePanel, isOpen }: SidePanelProps) => {
  const { models, isLoadingModels, getPredictions } = useApi();

  const [selectedModels, setSelectedModels] = useState<string[]>(['XGBoost_Tuned']);
  const [forecastHorizon, setForecastHorizon] = useState<number>(7);

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedModels((prev) => (checked ? [...prev, name] : prev.filter((modelId) => modelId !== name)));
  };

  const handleForecast = () => {
    getPredictions({
      model_ids: selectedModels,
      forecast_horizon: forecastHorizon
    });
  };

  return (
    <Box sx={{ p: 2, display: isOpen ? 'block' : 'none', width: 320, flexShrink: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Налаштування</Typography>
          <IconButton onClick={togglePanel}>
            <FirstPageIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Typography gutterBottom>Вибір моделей:</Typography>
        <FormGroup sx={{ mb: 3, overflow: 'hidden' }}>
          {isLoadingModels
            ? Array.from(new Array(4)).map((_, index) => (
                <Skeleton key={index} variant="text" width="80%" sx={{ mb: 1 }} />
              ))
            : models &&
              Object.keys(models).map((modelId) => (
                <FormControlLabel
                  key={modelId}
                  control={
                    <Checkbox checked={selectedModels.includes(modelId)} onChange={handleModelChange} name={modelId} />
                  }
                  label={modelId}
                />
              ))}
        </FormGroup>

        <TextField
          label="Горизонт прогнозу (днів)"
          type="number"
          value={forecastHorizon}
          onChange={(e) => setForecastHorizon(Math.max(1, parseInt(e.target.value, 10)))}
          InputProps={{ inputProps: { min: 1, max: 30 } }}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
        />

        <Box sx={{ mt: 'auto' }}>
          <Button variant="contained" color="primary" fullWidth onClick={handleForecast}>
            Сформувати прогноз
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export { SidePanel };
