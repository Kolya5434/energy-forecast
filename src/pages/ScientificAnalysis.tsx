import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';

// Import tabs
import { ErrorAnalysisTab } from './components/scientific/ErrorAnalysisTab';
import { ExportTab } from './components/scientific/ExportTab';
import { ResidualAnalysisTab } from './components/scientific/ResidualAnalysisTab';
import { StatisticalTestsTab } from './components/scientific/StatisticalTestsTab';
import { VisualizationsTab } from './components/scientific/VisualizationsTab';

export const ScientificAnalysis = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {t('Scientific Analysis')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('Детальний науковий аналіз моделей прогнозування')}
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AssessmentIcon />} iconPosition="start" label={t('Статистичні тести')} />
          <Tab icon={<TimelineIcon />} iconPosition="start" label={t('Аналіз залишків')} />
          <Tab icon={<BubbleChartIcon />} iconPosition="start" label={t('Візуалізації')} />
          <Tab icon={<BarChartIcon />} iconPosition="start" label={t('Аналіз помилок')} />
          <Tab icon={<CodeIcon />} iconPosition="start" label={t('Експорт')} />
        </Tabs>

        {/* Tab 0: Statistical Tests */}
        {activeTab === 0 && (
          <Box sx={{ py: 2 }}>
            <StatisticalTestsTab />
          </Box>
        )}

        {/* Tab 1: Residual Analysis */}
        {activeTab === 1 && (
          <Box sx={{ py: 2 }}>
            <ResidualAnalysisTab />
          </Box>
        )}

        {/* Tab 2: Visualizations */}
        {activeTab === 2 && (
          <Box sx={{ py: 2 }}>
            <VisualizationsTab />
          </Box>
        )}

        {/* Tab 3: Error Analysis */}
        {activeTab === 3 && (
          <Box sx={{ py: 2 }}>
            <ErrorAnalysisTab />
          </Box>
        )}

        {/* Tab 4: Export */}
        {activeTab === 4 && (
          <Box sx={{ py: 2 }}>
            <ExportTab />
          </Box>
        )}
      </Paper>
    </Box>
  );
};
