import { useTranslation } from 'react-i18next';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface FeatureImportanceTableProps {
  chartData: ChartDataPoint[];
}

export const FeatureImportanceTable = ({ chartData }: FeatureImportanceTableProps) => {
  const { t } = useTranslation();

  return (
    <TableContainer sx={{ maxHeight: 500 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>№</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('Назва ознаки')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {t('Важливість')}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {t('Відносна важливість (%)')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.map((row, index) => {
            const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((row.value / totalValue) * 100).toFixed(2);

            return (
              <TableRow key={row.name} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{row.value.toFixed(4)}</TableCell>
                <TableCell align="right">{percentage}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};