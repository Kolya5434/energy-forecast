import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { LoadingFallback } from './components/LoadingFallback';
import { darkTheme, lightTheme } from '../theme';
import { AppProviders } from './context';
import { Header } from './pages/Header.tsx';
import type { View } from './types/shared.ts';

export type ThemeMode = 'light' | 'dark' | 'system';

// Lazy load page components
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
const ScientificAnalysis = lazy(() =>
  import('./pages/ScientificAnalysis.tsx').then((m) => ({ default: m.ScientificAnalysis }))
);
const HelpContent = lazy(() => import('./pages/HelpContent.tsx').then((m) => ({ default: m.HelpContent })));

// Lazy load analytics components (not critical for initial load)
const Analytics = lazy(() => import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })));

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
      case 'scientific':
        return <ScientificAnalysis />;
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
        <AppProviders>
          <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Header
                toggleTheme={toggleTheme}
                activeView={activeView}
                setActiveView={handleSetActiveView}
                themeMode={themeMode}
              />
              <Suspense fallback={<LoadingFallback />}>
                {renderContent()}
              </Suspense>
            </Box>
          </Box>
          <Suspense fallback={null}>
            <Analytics />
            <SpeedInsights />
          </Suspense>
        </AppProviders>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
