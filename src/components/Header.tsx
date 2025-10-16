import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Box, Button, IconButton, Paper, useTheme } from '@mui/material';





// Define the props the component expects to receive
interface HeaderProps {
  toggleTheme: () => void;
  togglePanel: () => void;
  isPanelOpen?: boolean;
}

const Header = ({ toggleTheme, togglePanel, isPanelOpen }: HeaderProps) => {
  const theme = useTheme();
  
  return (
    <Box component="header" sx={{ p: 2, flexShrink: 0 }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderRadius: 3, // Rounded corners
          backgroundColor: 'background.paper', // Uses theme's paper color
        }}
      >
        {/* Box for navigation links */}
        <Box>
          {!isPanelOpen ? <Button onClick={togglePanel}>Open filter</Button> : null}
          <Button color="inherit">Link</Button>
          <Button color="inherit">Link</Button>
          <Button color="inherit">Link</Button>
        </Box>
        
        {/* Theme toggle button */}
        <IconButton onClick={toggleTheme} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Paper>
    </Box>
  );
};

export { Header };