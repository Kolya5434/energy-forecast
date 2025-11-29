import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';

interface LoadingFallbackProps {
  fullHeight?: boolean;
  size?: number;
}

export const LoadingFallback = ({ fullHeight = false, size = 40 }: LoadingFallbackProps) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullHeight ? '100vh' : 'auto',
        flexGrow: fullHeight ? 0 : 1,
        p: 4
      }}
    >
      <Stack direction="column" alignItems="center" spacing={2}>
        <CircularProgress size={size} />
        <Typography variant="body1" color="text.secondary">
          {t('Завантаження...')}
        </Typography>
      </Stack>
    </Box>
  );
};
