import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { DEFAULT_OPTIONS_SELECT } from '@/shared/constans.ts';
import type { ISelectOption } from '@/types/shared.ts';
import { useTranslation } from 'react-i18next';

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
  
  const { t } = useTranslation();
  
  return (
    <FormControl size={size} sx={{ minWidth }} disabled={disabled}>
      <InputLabel id="topn-select-label">{t(label)}</InputLabel>
      <Select
        labelId="topn-select-label"
        id="topn-select"
        value={value.toString()}
        label={label}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value.toString()}>
            {t(option.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
