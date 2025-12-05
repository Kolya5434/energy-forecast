import { useTranslation } from 'react-i18next';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, Typography } from '@mui/material';

import type { ChartType } from '@/types/shared';
import { ChartTypeSelector } from '@/pages/ChartTypeSelector';

interface ChartControlsProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  onClearData: () => void;
  showClearButton: boolean;
  title?: string;
}

export const ChartControls = ({
  chartType,
  onChartTypeChange,
  onClearData,
  showClearButton,
  title
}: ChartControlsProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
      <Typography variant="h5">{title || t('Графік Прогнозів')}</Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {showClearButton && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={onClearData}
          >
            {t('Очистити дані')}
          </Button>
        )}
        <ChartTypeSelector value={chartType} onChange={onChartTypeChange} />
      </Box>
    </Box>
  );
};