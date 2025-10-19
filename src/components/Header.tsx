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

export const Header = ({ toggleTheme, togglePanel, isPanelOpen, setActiveView, activeView }: HeaderProps) => {
  const theme = useTheme();

  return (
    <Box component="header" sx={{ p: 2, flexShrink: 0, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderRadius: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isPanelOpen ? (
            <IconButton
              onClick={togglePanel}
              color="inherit"
              sx={{
                mr: 1,
                visibility: activeView === 'forecast' ? 'visible' : 'hidden'
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          <ButtonGroup variant="text" aria-label="view navigation">
            <Button
              onClick={() => setActiveView('forecast')}
              variant={activeView === 'forecast' ? 'contained' : 'text'}
            >
              Графік прогнозів
            </Button>
            <Button
              onClick={() => setActiveView('interpretation')}
              variant={activeView === 'interpretation' ? 'contained' : 'text'}
            >
              Аналіз важливості ознак
            </Button>
          </ButtonGroup>
        </Box>

        {/* Theme toggle button */}
        <IconButton onClick={toggleTheme} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Paper>
    </Box>
  );
};
