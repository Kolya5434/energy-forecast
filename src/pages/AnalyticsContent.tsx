import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Paper, Tab, Tabs } from '@mui/material';

import { AnomaliesTab } from './components/analytics/AnomaliesTab';
import { CompareTab } from './components/analytics/CompareTab';
import { DecompositionTab } from './components/analytics/DecompositionTab';
import { PatternsTab } from './components/analytics/PatternsTab';
import { PeaksTab } from './components/analytics/PeaksTab';
import classes from './MainContent.module.scss';

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

        {renderTabContent()}
      </Paper>
    </Box>
  );
};
