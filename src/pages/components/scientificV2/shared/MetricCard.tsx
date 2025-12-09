import type { ReactNode } from 'react';

import { Box, Card, CardContent, Tooltip, Typography } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  tooltip?: string;
}

export const MetricCard = ({ title, value, subtitle, icon, color = 'primary', tooltip }: MetricCardProps) => {
  const content = (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: `${color}.main` }}>
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="div" sx={{ color: `${color}.main`, fontWeight: 600 }}>
          {typeof value === 'number' ? value.toFixed(4) : value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow>
      {content}
    </Tooltip>
  ) : content;
};