import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssessmentIcon from '@mui/icons-material/Assessment';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { LoadingFallback } from '../../../components/LoadingFallback';
import { useApi } from '../../../context/useApi';
import type { LaTeXExportType } from '../../../types/scientific';

const LATEX_EXPORT_TYPES: Array<{ value: LaTeXExportType; label: string; description: string }> = [
  { value: 'metrics_table', label: 'Таблиця метрик', description: 'Лише таблиця порівняння метрик' },
  { value: 'statistical_tests', label: 'Статистичні тести', description: 'Таблиця результатів статистичних тестів' },
  { value: 'feature_importance', label: 'Важливість ознак', description: 'Таблиця важливості ознак' },
  { value: 'full_document', label: 'Повний документ', description: 'Повний LaTeX документ з усіма розділами' }
];

export const ExportTab = () => {
  const { t } = useTranslation();
  const {
    models,
    isLoadingModels,
    latexExportResult,
    isLoadingLatexExport,
    latexExportError,
    exportLatex,
    reproducibilityReportResult,
    isLoadingReproducibilityReport,
    reproducibilityReportError,
    getReproducibilityReport
  } = useApi();

  // LaTeX Export State
  const [exportType, setExportType] = useState<LaTeXExportType>('full_document');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [includeMethodology, setIncludeMethodology] = useState(true);
  const [title, setTitle] = useState('Energy Forecasting System Analysis');
  const [author, setAuthor] = useState('');
  const [abstract, setAbstract] = useState('');

  // Get ML models only
  const mlModels = models
    ? Object.entries(models)
        .filter(([, info]) => info.type === 'ml')
        .map(([id]) => id)
    : [];

  const handleExportTypeChange = (event: SelectChangeEvent) => {
    setExportType(event.target.value as LaTeXExportType);
  };

  const handleModelChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedModels(typeof value === 'string' ? value.split(',') : value);
  };

  const handleExportLatex = () => {
    exportLatex({
      export_type: exportType,
      model_ids: selectedModels.length > 0 ? selectedModels : undefined,
      include_methodology: includeMethodology,
      title: title || undefined,
      author: author || undefined,
      abstract: abstract || undefined
    });
  };

  const handleCopyLatex = () => {
    if (!latexExportResult) return;
    navigator.clipboard.writeText(latexExportResult.latex_code);
  };

  const handleDownloadLatex = () => {
    if (!latexExportResult) return;
    const blob = new Blob([latexExportResult.latex_code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportType}_${new Date().toISOString().split('T')[0]}.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    getReproducibilityReport({
      include_git: true,
      include_system: true,
      include_packages: true,
      format: 'markdown'
    });
  };

  const handleDownloadMarkdown = () => {
    if (!reproducibilityReportResult?.markdown_report) return;
    const blob = new Blob([reproducibilityReportResult.markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reproducibility_report_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* LaTeX Export Section */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CodeIcon color="primary" />
              <Typography variant="h6">{t('LaTeX Експорт')}</Typography>
            </Stack>

            <Stack spacing={2}>
              {/* Export Type */}
              <FormControl fullWidth size="small">
                <InputLabel>{t('Тип експорту')}</InputLabel>
                <Select value={exportType} onChange={handleExportTypeChange}>
                  {LATEX_EXPORT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body2">{t(type.label)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t(type.description)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Model Selection */}
              <FormControl fullWidth size="small">
                <InputLabel>{t('Моделі (опціонально)')}</InputLabel>
                <Select
                  multiple
                  value={selectedModels}
                  onChange={handleModelChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  disabled={isLoadingModels}
                >
                  {mlModels.map((modelId) => (
                    <MenuItem key={modelId} value={modelId}>
                      <Checkbox checked={selectedModels.indexOf(modelId) > -1} />
                      <ListItemText primary={modelId} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Additional Options for Full Document */}
              {exportType === 'full_document' && (
                <>
                  <TextField
                    label={t('Назва документа')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label={t('Автор')}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label={t('Анотація (опціонально)')}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    size="small"
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={includeMethodology} onChange={(e) => setIncludeMethodology(e.target.checked)} />
                    }
                    label={t('Включити розділ методології')}
                  />
                </>
              )}

              {/* Generate Button */}
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleExportLatex}
                disabled={isLoadingLatexExport}
                fullWidth
              >
                {t('Згенерувати LaTeX')}
              </Button>
            </Stack>

            {/* LaTeX Result */}
            {isLoadingLatexExport && <LoadingFallback />}

            {latexExportError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {latexExportError}
              </Alert>
            )}

            {latexExportResult && !isLoadingLatexExport && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{t('Згенерований LaTeX код')}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyLatex}>
                        {t('Копіювати')}
                      </Button>
                      <Button size="small" startIcon={<DownloadIcon />} onClick={handleDownloadLatex}>
                        {t('Завантажити')}
                      </Button>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      maxHeight: 300,
                      overflow: 'auto',
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {latexExportResult.latex_code}
                    </pre>
                  </Box>

                  {latexExportResult.compilation_instructions && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">{latexExportResult.compilation_instructions}</Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </Paper>
        </Box>

        {/* Reproducibility Report Section */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AssessmentIcon color="primary" />
              <Typography variant="h6">{t('Звіт про відтворюваність')}</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" paragraph>
              {t(
                'Звіт містить інформацію про системне середовище, версії пакетів та інструкції для відтворення результатів'
              )}
            </Typography>

            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleGenerateReport}
              disabled={isLoadingReproducibilityReport}
              fullWidth
            >
              {t('Згенерувати звіт')}
            </Button>

            {/* Report Result */}
            {isLoadingReproducibilityReport && <LoadingFallback />}

            {reproducibilityReportError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {reproducibilityReportError}
              </Alert>
            )}

            {reproducibilityReportResult && !isLoadingReproducibilityReport && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Згенеровано')}: {new Date(reproducibilityReportResult.metadata.generated_at).toLocaleString()}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* System Info Summary */}
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('Платформа')}:</strong> {reproducibilityReportResult.system_information.platform.system}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('Python')}:</strong> {reproducibilityReportResult.system_information.python.version}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('Пакетів')}:</strong>{' '}
                    {Object.keys(reproducibilityReportResult.software_environment.package_versions).length}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Markdown Preview */}
                  {reproducibilityReportResult.markdown_report && (
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">{t('Markdown звіт')}</Typography>
                        <Button size="small" startIcon={<DownloadIcon />} onClick={handleDownloadMarkdown}>
                          {t('Завантажити')}
                        </Button>
                      </Stack>
                      <Box
                        sx={{
                          maxHeight: 300,
                          overflow: 'auto',
                          bgcolor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem'
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {reproducibilityReportResult.markdown_report}
                        </pre>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};
