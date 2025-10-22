import { useMemo, useState } from 'react';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import { darkTheme, lightTheme } from '../theme';
import { Header } from './components/Header.tsx';
import { InterpretContent } from './components/InterpretContent.tsx';
import { MainContent } from './components/MainContent.tsx';
import { ShapForcePlot } from './components/ShapForcePlot.tsx';
import { SidePanel } from './components/SidePanel.tsx';
import { ApiProvider } from './context/ApiContext.tsx';
import type { View } from './types/shared.ts';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeView, setActiveView] = useState<View>('forecast');

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

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
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default App;
