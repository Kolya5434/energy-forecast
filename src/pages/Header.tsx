import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
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
  useMediaQuery
} from '@mui/material';

import type { ThemeMode } from '@/App';
import i18n, { loadLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import type { View } from '@/types/shared';

interface HeaderProps {
  toggleTheme: () => void;
  setActiveView: (view: View) => void;
  activeView: View;
  themeMode: ThemeMode;
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
  { id: 'analytics', label: 'Аналітика' },
  { id: 'scientific', label: 'Scientific Analysis' },
  { id: 'help', label: 'FAQ' }
];

const HeaderComponent = ({ toggleTheme, setActiveView, activeView, themeMode }: HeaderProps) => {
  const { t } = useTranslation();
  const isSmall = useMediaQuery('(max-width:1920px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentLang = i18n.resolvedLanguage || i18n.language || 'uk';

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Brightness7Icon />;
      case 'dark':
        return <Brightness4Icon />;
      case 'system':
        return <BrightnessAutoIcon />;
      default:
        return <BrightnessAutoIcon />;
    }
  };

  const handleLanguageToggle = () => {
    const index = SUPPORTED_LANGUAGES.indexOf(currentLang as SupportedLanguage);
    const nextLang = SUPPORTED_LANGUAGES[(index + 1) % SUPPORTED_LANGUAGES.length];

    loadLanguage(nextLang).catch((err) => {
      console.error('Language change failed:', err);
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
            {getThemeIcon()}
          </IconButton>
          <IconButton
            onClick={handleLanguageToggle}
            color="inherit"
            aria-label={`current language is ${currentLang}`}
            sx={{ ':hover': { backgroundColor: 'background.paper' } }}
          >
            <LanguageIcon />
            <Box component="span" sx={{ ml: 1, fontSize: 14, ':focus-visible': { outline: 'none' } }}>
              {currentLang.toUpperCase()}
            </Box>
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export const Header = memo(HeaderComponent);
