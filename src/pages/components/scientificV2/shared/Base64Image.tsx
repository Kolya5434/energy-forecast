import { Box, Paper, Typography } from '@mui/material';

interface Base64ImageProps {
  data: string;
  alt: string;
  title?: string;
  maxWidth?: number | string;
}

export const Base64Image = ({ data, alt, title, maxWidth = '100%' }: Base64ImageProps) => {
  if (!data) return null;

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <Box
        component="img"
        src={`data:image/png;base64,${data}`}
        alt={alt}
        sx={{
          maxWidth,
          width: '100%',
          height: 'auto',
          display: 'block',
          mx: 'auto',
          borderRadius: 1
        }}
      />
    </Paper>
  );
};
