import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, ButtonGroup, IconButton, Paper, useTheme } from '@mui/material';

import type { View } from '../types/shared';

interface HeaderProps {
  toggleTheme: () => void;
  togglePanel: () => void;
  isPanelOpen: boolean;
  setActiveView: (view: View) => void;
  activeView: View;
}

interface ViewConfig {
  id: View;
  label: string;
}

const VIEW_CONFIGS: ViewConfig[] = [
  { id: 'forecast', label: 'Графік прогнозів' },
  { id: 'interpretation', label: 'Аналіз важливості ознак' },
  { id: 'shap_force_plot', label: 'Візуалізація SHAP Force Plot' },
  { id: 'evaluation', label: 'Evaluation' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'help', label: 'FAQ' },
];

export const Header = ({ toggleTheme, togglePanel, isPanelOpen, setActiveView, activeView }: HeaderProps) => {
  const theme = useTheme();
  const showMenuButton = !isPanelOpen && activeView === 'forecast';

  return (
    <Box component="header" sx={{ p: 2, flexShrink: 0, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 1,
          borderRadius: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <IconButton
            onClick={togglePanel}
            color="inherit"
            sx={{
              visibility: showMenuButton ? 'visible' : 'hidden',
              opacity: showMenuButton ? 1 : 0,
              transition: 'opacity 0.2s'
            }}
            aria-label="toggle menu"
          >
            <MenuIcon />
          </IconButton>

          <ButtonGroup variant="text" aria-label="view navigation" sx={{ flexWrap: 'wrap' }}>
            {VIEW_CONFIGS.map(({ id, label }) => (
              <Button
                key={id}
                onClick={() => setActiveView(id)}
                variant={activeView === id ? 'contained' : 'text'}
                sx={{
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap'
                }}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};
