import { useState } from 'react';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import { darkTheme, lightTheme } from '../theme';
import { Header } from './components/Header.tsx';
import { InterpretContent } from './components/InterpretContent.tsx';
import { MainContent } from './components/MainContent.tsx';
import { SidePanel } from './components/SidePanel.tsx';
import { ApiProvider } from './context/ApiContext.tsx';
import type { View } from './types/shared.ts';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeView, setActiveView] = useState<View>('forecast');

  const theme = isDarkMode ? darkTheme : lightTheme;
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiProvider>
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
          {activeView === 'forecast' ? <SidePanel isOpen={isPanelOpen} togglePanel={togglePanel} /> : null}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Header
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
              isPanelOpen={isPanelOpen}
              togglePanel={togglePanel}
              activeView={activeView}
              setActiveView={setActiveView}
            />
            {activeView === 'forecast' ? <MainContent /> : null}
            {activeView === 'interpretation' ? <InterpretContent /> : null}
          </Box>
          {/*<RightPanel />*/}
        </Box>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
