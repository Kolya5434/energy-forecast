import DownloadIcon from '@mui/icons-material/Download';
import { Button, Stack } from '@mui/material';

interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportWord: () => void;
  onExportPDF: () => void;
  disabled: boolean;
}

export const ExportButtons = ({ onExportExcel, onExportWord, onExportPDF, disabled }: ExportButtonsProps) => {

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onExportExcel}
        disabled={disabled}
      >
        Excel
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onExportWord}
        disabled={disabled}
      >
        Word
      </Button>
      <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={onExportPDF} disabled={disabled}>
        PDF
      </Button>
    </Stack>
  );
};