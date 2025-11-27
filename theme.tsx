import { createTheme } from '@mui/material/styles';

const commonSettings = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
  },
  shape: {
    borderRadius: 8
  }
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    },
    background: {
      default: '#e1e7ed',
      paper: '#ffffff'
    },
    text: {
      secondary: '#000'
    }
  },
  ...commonSettings
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    text: {
      secondary: '#fff'
    },
    primary: {
      main: '#90caf9'
    },
    secondary: {
      main: '#f48fb1'
    },
    background: {
      default: '#1a222c',
      paper: '#1e1e1e'
    }
  },
  ...commonSettings
});
