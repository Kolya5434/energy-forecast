
import { useState } from 'react';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import { darkTheme, lightTheme } from '../theme';
import { ApiProvider } from './context/ApiContext.tsx';
import { Header } from './components/Header.tsx';
import { SidePanel } from './components/SidePanel.tsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiProvider>
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
          <SidePanel isOpen={isPanelOpen} togglePanel={togglePanel} />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Header toggleTheme={() => setIsDarkMode(!isDarkMode)} isPanelOpen={isPanelOpen} togglePanel={togglePanel} />
            {/*<MainContent />*/}
          </Box>
          {/*<RightPanel />*/}
        </Box>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
