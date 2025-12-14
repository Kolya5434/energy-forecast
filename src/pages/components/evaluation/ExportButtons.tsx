import { memo, useCallback } from 'react';

import DownloadIcon from '@mui/icons-material/Download';
import { Button, Stack } from '@mui/material';

import { preloadDocx, preloadJspdf, preloadXlsx } from '@/helpers/preloadExportLibs';

interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportWord: () => void;
  onExportPDF: () => void;
  disabled: boolean;
}

export const ExportButtons = memo(({ onExportExcel, onExportWord, onExportPDF, disabled }: ExportButtonsProps) => {
  const handleExcelHover = useCallback(() => preloadXlsx(), []);
  const handleWordHover = useCallback(() => preloadDocx(), []);
  const handlePdfHover = useCallback(() => preloadJspdf(), []);

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onExportExcel}
        onMouseEnter={handleExcelHover}
        onFocus={handleExcelHover}
        disabled={disabled}
      >
        Excel
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onExportWord}
        onMouseEnter={handleWordHover}
        onFocus={handleWordHover}
        disabled={disabled}
      >
        Word
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onExportPDF}
        onMouseEnter={handlePdfHover}
        onFocus={handlePdfHover}
        disabled={disabled}
      >
        PDF
      </Button>
    </Stack>
  );
});

ExportButtons.displayName = 'ExportButtons';