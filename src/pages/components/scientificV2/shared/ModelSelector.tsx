import { useTranslation } from 'react-i18next';

import { Box, Checkbox, Chip, FormControl, InputLabel, ListItemText, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { useApi } from '@/context/useApi';

interface ModelSelectorProps {
  selectedModels: string[];
  onChange: (models: string[]) => void;
  multiple?: boolean;
  label?: string;
  filterTypes?: ('ml' | 'classical' | 'ensemble' | 'dl')[];
  minSelection?: number;
  maxSelection?: number;
}

export const ModelSelector = ({
  selectedModels,
  onChange,
  multiple = true,
  label,
  filterTypes,
  minSelection,
  maxSelection
}: ModelSelectorProps) => {
  const { t } = useTranslation();
  const { models, isLoadingModels } = useApi();

  const availableModels = models
    ? Object.entries(models)
        .filter(([, info]) => !filterTypes || filterTypes.includes(info.type))
        .map(([id]) => id)
    : [];

  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const value = event.target.value;
    if (multiple) {
      const newSelection = typeof value === 'string' ? value.split(',') : value;
      if (maxSelection && newSelection.length > maxSelection) return;
      onChange(newSelection);
    } else {
      const singleValue = typeof value === 'string' ? value : value[0];
      onChange(singleValue ? [singleValue] : []);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label || t('Виберіть моделі')}</InputLabel>
      <Select
        multiple={multiple}
        value={multiple ? selectedModels : selectedModels[0] || ''}
        onChange={handleChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(Array.isArray(selected) ? selected : [selected]).map((value) => (
              <Chip key={value} label={value} size="small" />
            ))}
          </Box>
        )}
        disabled={isLoadingModels}
      >
        {availableModels.map((modelId) => (
          <MenuItem
            key={modelId}
            value={modelId}
            disabled={minSelection !== undefined && selectedModels.length <= minSelection && selectedModels.includes(modelId)}
          >
            {multiple && <Checkbox checked={selectedModels.indexOf(modelId) > -1} />}
            <ListItemText primary={modelId} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};