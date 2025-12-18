import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, CircularProgress, FormControlLabel, Paper, Switch, Tab, Tabs, Typography } from '@mui/material';

// Lazy load legacy tabs
const ErrorAnalysisTab = lazy(() =>
  import('./components/scientific/ErrorAnalysisTab').then((m) => ({ default: m.ErrorAnalysisTab }))
);
const ExportTab = lazy(() => import('./components/scientific/ExportTab').then((m) => ({ default: m.ExportTab })));
const ResidualAnalysisTab = lazy(() =>
  import('./components/scientific/ResidualAnalysisTab').then((m) => ({ default: m.ResidualAnalysisTab }))
);
const StatisticalTestsTab = lazy(() =>
  import('./components/scientific/StatisticalTestsTab').then((m) => ({ default: m.StatisticalTestsTab }))
);
const VisualizationsTab = lazy(() =>
  import('./components/scientific/VisualizationsTab').then((m) => ({ default: m.VisualizationsTab }))
);

// Lazy load V2 tabs
const BenchmarkTab = lazy(() =>
  import('./components/scientificV2/BenchmarkTab').then((m) => ({ default: m.BenchmarkTab }))
);
const DriftTab = lazy(() => import('./components/scientificV2/DriftTab').then((m) => ({ default: m.DriftTab })));
const EnsembleTab = lazy(() =>
  import('./components/scientificV2/EnsembleTab').then((m) => ({ default: m.EnsembleTab }))
);
const ExplainabilityTab = lazy(() =>
  import('./components/scientificV2/ExplainabilityTab').then((m) => ({ default: m.ExplainabilityTab }))
);
const FeatureAnalysisTab = lazy(() =>
  import('./components/scientificV2/FeatureAnalysisTab').then((m) => ({ default: m.FeatureAnalysisTab }))
);
const HorizonTab = lazy(() => import('./components/scientificV2/HorizonTab').then((m) => ({ default: m.HorizonTab })));
const MonitoringTab = lazy(() =>
  import('./components/scientificV2/MonitoringTab').then((m) => ({ default: m.MonitoringTab }))
);
const ProbabilisticTab = lazy(() =>
  import('./components/scientificV2/ProbabilisticTab').then((m) => ({ default: m.ProbabilisticTab }))
);
const UncertaintyTab = lazy(() =>
  import('./components/scientificV2/UncertaintyTab').then((m) => ({ default: m.UncertaintyTab }))
);

// Feature flag for V2 tabs (set to true to show new tabs)
const SHOW_V2_TABS = false;

export const ScientificAnalysis = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [showV2Tabs, setShowV2Tabs] = useState(SHOW_V2_TABS);

  const v2Tabs = [
    { icon: <AutoGraphIcon />, label: t('Невизначеність'), component: <UncertaintyTab /> },
    { icon: <GroupWorkIcon />, label: t('Ансамбль'), component: <EnsembleTab /> },
    { icon: <TrendingUpIcon />, label: t('Дрейф'), component: <DriftTab /> },
    { icon: <PsychologyIcon />, label: t('XAI'), component: <ExplainabilityTab /> },
    { icon: <TimelineIcon />, label: t('Горизонт'), component: <HorizonTab /> },
    { icon: <CategoryIcon />, label: t('Ознаки'), component: <FeatureAnalysisTab /> },
    { icon: <SpeedIcon />, label: t('Бенчмарк'), component: <BenchmarkTab /> },
    { icon: <ShowChartIcon />, label: t('Ймовірнісний'), component: <ProbabilisticTab /> },
    { icon: <MonitorHeartIcon />, label: t('Моніторинг'), component: <MonitoringTab /> }
  ];

  const legacyTabs = [
    { icon: <AssessmentIcon />, label: t('Статистичні тести'), component: <StatisticalTestsTab /> },
    { icon: <AnalyticsIcon />, label: t('Аналіз залишків'), component: <ResidualAnalysisTab /> },
    { icon: <BubbleChartIcon />, label: t('Візуалізації'), component: <VisualizationsTab /> },
    { icon: <BarChartIcon />, label: t('Аналіз помилок'), component: <ErrorAnalysisTab /> },
    { icon: <CodeIcon />, label: t('Експорт'), component: <ExportTab /> }
  ];

  const tabs = showV2Tabs ? [...v2Tabs, ...legacyTabs] : legacyTabs;
  const v2TabsCount = v2Tabs.length;

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflow: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, minHeight: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {t('Scientific Analysis')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('Детальний науковий аналіз моделей прогнозування')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showV2Tabs}
                onChange={(e) => {
                  setShowV2Tabs(e.target.checked);
                  setActiveTab(0);
                }}
                size="small"
              />
            }
            label={<Typography variant="caption">{t('beta tabs')}</Typography>}
          />
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, flexShrink: 0 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{
                minHeight: 48,
                // Add visual separator before legacy tabs when V2 tabs are shown
                ...(showV2Tabs &&
                  index === v2TabsCount && {
                    borderLeft: 2,
                    borderColor: 'divider',
                    ml: 1
                  })
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Box sx={{ py: 2 }}>{tabs[activeTab]?.component}</Box>
          </Suspense>
        </Box>
      </Paper>
    </Box>
  );
};
