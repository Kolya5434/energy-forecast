import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { darkTheme, lightTheme } from '../theme';
import { ApiProvider } from './context/ApiContext.tsx';
import type { View } from './types/shared.ts';

export type ThemeMode = 'light' | 'dark' | 'system';

const Header = lazy(() => import('./pages/Header.tsx').then((m) => ({ default: m.Header })));
const MainContent = lazy(() => import('./pages/MainContent.tsx').then((m) => ({ default: m.MainContent })));
const InterpretContent = lazy(() =>
  import('./pages/InterpretContent.tsx').then((m) => ({ default: m.InterpretContent }))
);
const ShapForcePlot = lazy(() => import('./pages/ShapForcePlot.tsx').then((m) => ({ default: m.ShapForcePlot })));
const EvaluationContent = lazy(() =>
  import('./pages/EvaluationContent.tsx').then((m) => ({ default: m.EvaluationContent }))
);
const SimulationContent = lazy(() =>
  import('./pages/SimulationContent.tsx').then((m) => ({ default: m.SimulationContent }))
);
const AnalyticsContent = lazy(() =>
  import('./pages/AnalyticsContent.tsx').then((m) => ({ default: m.AnalyticsContent }))
);
const HelpContent = lazy(() => import('./pages/HelpContent.tsx').then((m) => ({ default: m.HelpContent })));

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [activeView, setActiveView] = useState<View>('forecast');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemPrefersDark;
    }
    return themeMode === 'dark';
  }, [themeMode, systemPrefersDark]);

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);
  const handleSetActiveView = useCallback((view: View) => setActiveView(view), []);

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
      case 'analytics':
        return <AnalyticsContent />;
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
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>}>
            <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header
                  toggleTheme={toggleTheme}
                  activeView={activeView}
                  setActiveView={handleSetActiveView}
                  themeMode={themeMode}
                />
                <Suspense
                  fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                      <CircularProgress />
                    </Box>
                  }
                >
                  {renderContent()}
                </Suspense>
              </Box>
            </Box>
          </Suspense>
          <Analytics />
          <SpeedInsights />
        </ApiProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
