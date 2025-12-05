import { useTranslation } from 'react-i18next';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';

interface MetricConfig {
  key: string;
  label: string;
  format: (v: number | null) => string;
}

interface MetricsTableProps {
  sortedTableData: Array<Record<string, number | string | null>>;
  metrics: MetricConfig[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (metric: string) => void;
  getBestWorst: (metric: string) => { best: number | null; worst: number | null };
  isLoading: boolean;
}

export const MetricsTable = ({
  sortedTableData,
  metrics,
  sortBy,
  sortOrder,
  onSort,
  getBestWorst,
  isLoading
}: MetricsTableProps) => {
  const { t } = useTranslation();

  if (sortedTableData.length === 0) {
    if (isLoading) {
      return <LoadingFallback />;
    }
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {t('Немає даних для відображення. Виберіть моделі для аналізу.')}
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('Модель')}</TableCell>
            {metrics.map((metric) => (
              <TableCell
                key={metric.key}
                align="right"
                sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => onSort(metric.key)}
              >
                {metric.label} {sortBy === metric.key && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTableData.map((row) => {
            const { best, worst } = getBestWorst(sortBy);
            const isBest = row[sortBy] === best;
            const isWorst = row[sortBy] === worst;

            return (
              <TableRow key={row.modelId as string} hover>
                <TableCell sx={{ fontWeight: 500 }}>{row.modelId}</TableCell>
                {metrics.map((metric) => {
                  const value = row[metric.key] as number | null;
                  const isSortedColumn = metric.key === sortBy;

                  return (
                    <TableCell
                      key={metric.key}
                      align="right"
                      sx={{
                        backgroundColor: isSortedColumn
                          ? isBest
                            ? 'rgba(102, 187, 106, 0.2)'
                            : isWorst
                              ? 'rgba(239, 83, 80, 0.2)'
                              : 'transparent'
                          : 'transparent',
                        fontWeight: isSortedColumn && isBest ? 'bold' : 'normal',
                        color:
                          isSortedColumn && isBest
                            ? 'success.dark'
                            : isSortedColumn && isWorst
                              ? 'error.dark'
                              : 'text.primary'
                      }}
                    >
                      {metric.format(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};