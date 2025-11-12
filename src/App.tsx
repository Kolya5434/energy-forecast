import { useMemo, useState } from 'react';

import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { darkTheme, lightTheme } from '../theme';
import { EvaluationContent } from './pages/EvaluationContent.tsx';
import { Header } from './pages/Header.tsx';
import { HelpContent } from './pages/HelpContent.tsx';
import { InterpretContent } from './pages/InterpretContent.tsx';
import { MainContent } from './pages/MainContent.tsx';
import { ShapForcePlot } from './pages/ShapForcePlot.tsx';
import { SidePanel } from './pages/SidePanel.tsx';
import { SimulationContent } from './pages/SimulationContent.tsx';
import { ApiProvider } from './context/ApiContext.tsx';
import type { View } from './types/shared.ts';

import './i18n';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState<View>('forecast');

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'), { noSsr: true });
  const [isPanelOpen, setIsPanelOpen] = useState(isXlUp);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const togglePanel = () => setIsPanelOpen((prev) => !prev);

  const showSidePanel = activeView === 'forecast';

  const renderContent = () => {
    switch (activeView) {
      case 'forecast':
        return <MainContent />;
      case 'interpretation':
        return <InterpretContent />;
      case 'shap_force_plot':
        return <ShapForcePlot />;
      case 'evaluation':
        return <EvaluationContent />;
      case 'simulation':
        return <SimulationContent />;
      case 'help':
        return <HelpContent />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <ApiProvider>
          <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            {showSidePanel ? <SidePanel isOpen={isPanelOpen} togglePanel={togglePanel} /> : null}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Header
                toggleTheme={toggleTheme}
                isPanelOpen={isPanelOpen}
                togglePanel={togglePanel}
                activeView={activeView}
                setActiveView={setActiveView}
              />
              {renderContent()}
            </Box>
            {/*<RightPanel />*/}
          </Box>
        </ApiProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
