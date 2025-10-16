import './App.css';

import { useState } from 'react';

import { ThemeProvider } from '@mui/material';

import { darkTheme, lightTheme } from '../theme';
import { ApiProvider } from './context/ApiContext.tsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <ApiProvider>Energy forecast</ApiProvider>
    </ThemeProvider>
  );
}

export default App;
