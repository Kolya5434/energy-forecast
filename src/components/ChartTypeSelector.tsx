import { useTranslation } from 'react-i18next';

import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { CHART_TYPES } from '../shared/constans.ts';
import type { ChartType } from '../types/shared.ts';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (value: ChartType) => void;
  label?: string;
  size?: 'small' | 'medium';
  minWidth?: number;
  disabled?: boolean;
  excludeTypes?: ChartType[];
}

export const ChartTypeSelector = ({
  value,
  onChange,
  label = 'Тип діаграми',
  size = 'small',
  minWidth = 200,
  disabled = false,
  excludeTypes = []
}: ChartTypeSelectorProps) => {
  const { t } = useTranslation();
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as ChartType);
  };

  const availableTypes = CHART_TYPES.filter((type) => !excludeTypes.includes(type.value));

  return (
    <FormControl size={size} sx={{ minWidth }} disabled={disabled}>
      <InputLabel id="chart-type-label">{t(label)}</InputLabel>
      <Select labelId="chart-type-label" id="chart-type-select" value={value} label={label} onChange={handleChange}>
        {availableTypes.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {t(type.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
