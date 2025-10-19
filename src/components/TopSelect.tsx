import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { DEFAULT_OPTIONS_SELECT } from '../shared/constans.ts';
import type { ISelectOption } from '../types/shared.ts';

interface ITopSelectProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: 'small' | 'medium';
  minWidth?: number;
  disabled?: boolean;
  options?: ISelectOption[];
}

export const TopSelect = ({
  value,
  onChange,
  label = 'Кількість ознак',
  size = 'small',
  minWidth = 180,
  disabled = false,
  options = DEFAULT_OPTIONS_SELECT
}: ITopSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl size={size} sx={{ minWidth }} disabled={disabled}>
      <InputLabel id="topn-select-label">{label}</InputLabel>
      <Select
        labelId="topn-select-label"
        id="topn-select"
        value={value.toString()}
        label={label}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value.toString()}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
