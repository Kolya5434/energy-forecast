import { lazy, ReactElement, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, CircularProgress, Paper, Tab, Tabs } from '@mui/material';

import classes from './MainContent.module.scss';

// Lazy load analytics tabs to defer echarts loading
const PeaksTab = lazy(() => import('./components/analytics/PeaksTab').then((m) => ({ default: m.PeaksTab })));
const PatternsTab = lazy(() => import('./components/analytics/PatternsTab').then((m) => ({ default: m.PatternsTab })));
const AnomaliesTab = lazy(() => import('./components/analytics/AnomaliesTab').then((m) => ({ default: m.AnomaliesTab })));
const DecompositionTab = lazy(() => import('./components/analytics/DecompositionTab').then((m) => ({ default: m.DecompositionTab })));
const CompareTab = lazy(() => import('./components/analytics/CompareTab').then((m) => ({ default: m.CompareTab })));

type AnalyticsTabType = 'peaks' | 'patterns' | 'anomalies' | 'decomposition' | 'compare';

interface TabConfig {
  id: AnalyticsTabType;
  label: string;
  icon: ReactElement;
  disabled?: boolean;
}

const TAB_CONFIGS: TabConfig[] = [
  { id: 'peaks', label: 'Пікові періоди', icon: <BarChartIcon /> },
  { id: 'patterns', label: 'Сезонні патерни', icon: <TimelineIcon /> },
  { id: 'anomalies', label: 'Аномалії', icon: <WarningAmberIcon /> },
  { id: 'decomposition', label: 'Декомпозиція', icon: <ShowChartIcon /> },
  { id: 'compare', label: 'Порівняння сценаріїв', icon: <CompareArrowsIcon /> }
];

export const AnalyticsContent = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('peaks');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'peaks':
        return <PeaksTab />;
      case 'patterns':
        return <PatternsTab />;
      case 'anomalies':
        return <AnomaliesTab />;
      case 'decomposition':
        return <DecompositionTab />;
      case 'compare':
        return <CompareTab />;
      default:
        return null;
    }
  };

  return (
    <Box component="main" className={classes.mainContent}>
      <Paper elevation={0} className={classes.paper}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {TAB_CONFIGS.map(({ id, label, icon, disabled }) => (
            <Tab
              key={id}
              value={id}
              icon={icon}
              iconPosition="start"
              label={t(label)}
              disabled={disabled}
            />
          ))}
        </Tabs>

        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress />
            </Box>
          }
        >
          {renderTabContent()}
        </Suspense>
      </Paper>
    </Box>
  );
};
