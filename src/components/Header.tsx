import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FilterListIcon from '@mui/icons-material/FilterList';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';

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
  { id: 'help', label: 'FAQ' }
];

export const Header = ({ toggleTheme, togglePanel, isPanelOpen, setActiveView, activeView }: HeaderProps) => {
  const theme = useTheme();
  const { i18n, t } = useTranslation();
  const isSmall = useMediaQuery('(max-width:1920px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showMenuButton = !isPanelOpen && activeView === 'forecast';

  const handleLanguageToggle = () => {
    const languages = ['uk', 'en', 'de', 'it'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextLang = languages[(currentIndex + 1) % languages.length];

    i18n.changeLanguage(nextLang).catch((err) => {
      console.error('Failed to change language:', err);
    });
  };

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
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ':hover': { backgroundColor: 'background.paper' }
            }}
            aria-label="toggle menu"
          >
            <FilterListIcon />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t('Фільтри')}
            </Box>
          </IconButton>

          {!isSmall ? (
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
                  {t(label)}
                </Button>
              ))}
            </ButtonGroup>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSmall ? (
            <>
              <Button
                startIcon={<MenuIcon />}
                onClick={() => setDrawerOpen(true)}
                variant="outlined"
                aria-label="open menu"
              >
                {t('Меню')}
              </Button>

              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                slotProps={{ paper: { sx: { width: 300 } } }}
              >
                <List>
                  {VIEW_CONFIGS.map(({ id, label }) => (
                    <ListItem key={id} disablePadding>
                      <ListItemButton
                        selected={activeView === id}
                        onClick={() => {
                          setActiveView(id);
                          setDrawerOpen(false);
                        }}
                        aria-label={`go to ${id}`}
                      >
                        <ListItemText primary={t(label)} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            </>
          ) : null}
          <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton
            onClick={handleLanguageToggle}
            color="inherit"
            aria-label={`current language: ${i18n.language}`}
            sx={{ ':hover': { backgroundColor: 'background.paper' } }}
          >
            <LanguageIcon />
            <Box component="span" sx={{ ml: 1, fontSize: 14, ':focus-visible': { outline: 'none' } }}>
              {i18n.language.toUpperCase()}
            </Box>
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};
