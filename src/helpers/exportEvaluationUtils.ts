import type { ExportTypes } from '@/types/shared';

interface MetricData {
  modelId: string;
  MAE: number | null;
  RMSE: number | null;
  'R²': number | null;
  'Explained Variance': number | null;
  'MAPE (%)': number | null;
  avg_latency_ms: number | null;
  memory_increment_mb: number | null;
}

interface EvaluationExportOptions {
  data: MetricData[];
  fileName: string;
  title?: string;
  includePerformance?: boolean;
}

/**
 * Format metric value for display
 */
const formatMetricValue = (value: number | null, decimals: number = 4): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
};

/**
 * Export evaluation metrics to Excel format (XLSX)
 */
const exportEvaluationToExcel = async (options: EvaluationExportOptions) => {
  // Dynamic import of XLSX library
  const XLSX = await import('xlsx');

  const { data, fileName, title = 'Порівняння моделей', includePerformance = true } = options;

  // Prepare worksheet data
  const worksheetData: (string | number | undefined)[][] = [
    [title],
    [`Дата експорту: ${new Date().toLocaleString('uk-UA')}`],
    [`Кількість моделей: ${data.length}`],
    [],
    []
  ];

  // Headers
  const headers = ['Модель', 'MAE', 'RMSE', 'R²', 'Explained Variance', 'MAPE (%)'];
  if (includePerformance) {
    headers.push('Latency (ms)', 'Memory (MB)');
  }
  worksheetData.push(headers);

  // Data rows
  data.forEach((row) => {
    const rowData = [
      row.modelId,
      formatMetricValue(row.MAE),
      formatMetricValue(row.RMSE),
      formatMetricValue(row['R²']),
      formatMetricValue(row['Explained Variance']),
      formatMetricValue(row['MAPE (%)'], 2)
    ];

    if (includePerformance) {
      rowData.push(formatMetricValue(row.avg_latency_ms, 2), formatMetricValue(row.memory_increment_mb, 2));
    }

    worksheetData.push(rowData);
  });

  // Add summary statistics
  worksheetData.push([]);
  worksheetData.push(['Статистика']);

  const calculateStats = (key: keyof MetricData) => {
    const values = data.map((d) => d[key]).filter((v): v is number => v !== null);
    if (values.length === 0) return { min: 'N/A', max: 'N/A', avg: 'N/A' };
    return {
      min: Math.min(...values).toFixed(4),
      max: Math.max(...values).toFixed(4),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(4)
    };
  };

  const maeStats = calculateStats('MAE');
  const rmseStats = calculateStats('RMSE');
  worksheetData.push(['', `Min: ${maeStats.min}`, `Min: ${rmseStats.min}`]);
  worksheetData.push(['', `Max: ${maeStats.max}`, `Max: ${rmseStats.max}`]);
  worksheetData.push(['', `Avg: ${maeStats.avg}`, `Avg: ${rmseStats.avg}`]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 12 }];
  if (includePerformance) {
    colWidths.push({ wch: 15 }, { wch: 15 });
  }
  worksheet['!cols'] = colWidths;

  // Create workbook and save
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Порівняння моделей');

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Export evaluation metrics to PDF format
 */
const exportEvaluationToPDF = async (options: EvaluationExportOptions) => {
  // Dynamic imports of jsPDF libraries
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  const { data, fileName, includePerformance = true } = options;

  const doc = new jsPDF({ orientation: 'landscape' });

  // Prepare table data
  const headers = ['Model', 'MAE', 'RMSE', 'R²', 'Explained Var.', 'MAPE (%)'];
  if (includePerformance) {
    headers.push('Latency (ms)', 'Memory (MB)');
  }

  const tableData = data.map((row) => {
    const rowData = [
      row.modelId,
      formatMetricValue(row.MAE),
      formatMetricValue(row.RMSE),
      formatMetricValue(row['R²']),
      formatMetricValue(row['Explained Variance']),
      formatMetricValue(row['MAPE (%)'], 2)
    ];

    if (includePerformance) {
      rowData.push(formatMetricValue(row.avg_latency_ms, 2), formatMetricValue(row.memory_increment_mb, 2));
    }

    return rowData;
  });

  // Add title and metadata
  doc.setFontSize(18);
  doc.text('Model Comparison', 14, 15);

  doc.setFontSize(10);
  doc.text(`Export Date: ${new Date().toLocaleString('en-US')}`, 14, 22);
  doc.text(`Total Models: ${data.length}`, 14, 28);

  // Create table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      ...(includePerformance && {
        6: { cellWidth: 25, halign: 'right' },
        7: { cellWidth: 25, halign: 'right' }
      })
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`${fileName}.pdf`);
};

/**
 * Export evaluation metrics to Word format (DOCX)
 */
const exportEvaluationToWord = async (options: EvaluationExportOptions) => {
  // Dynamic import of docx library
  const { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = await import('docx');

  const { data, fileName, title = 'Порівняння моделей', includePerformance = true } = options;

  // Title paragraphs
  const paragraphs = [
    new Paragraph({
      text: title,
      heading: 'Heading1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: `Дата експорту: ${new Date().toLocaleString('uk-UA')}`,
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: `Кількість моделей: ${data.length}`,
      spacing: { after: 300 }
    })
  ];

  // Table headers
  const headerCells = [
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Модель', bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MAE', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'RMSE', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'R²', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Explained Var.', bold: true })] })], width: { size: 14, type: WidthType.PERCENTAGE } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MAPE (%)', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } })
  ];

  if (includePerformance) {
    headerCells.push(
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Latency (ms)', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Memory (MB)', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } })
    );
  }

  // Table rows
  const tableRows = [
    new TableRow({ children: headerCells }),
    ...data.map((row) => {
      const cells = [
        new TableCell({ children: [new Paragraph({ text: row.modelId })] }),
        new TableCell({ children: [new Paragraph({ text: formatMetricValue(row.MAE) })] }),
        new TableCell({ children: [new Paragraph({ text: formatMetricValue(row.RMSE) })] }),
        new TableCell({ children: [new Paragraph({ text: formatMetricValue(row['R²']) })] }),
        new TableCell({ children: [new Paragraph({ text: formatMetricValue(row['Explained Variance']) })] }),
        new TableCell({ children: [new Paragraph({ text: formatMetricValue(row['MAPE (%)'], 2) })] })
      ];

      if (includePerformance) {
        cells.push(
          new TableCell({ children: [new Paragraph({ text: formatMetricValue(row.avg_latency_ms, 2) })] }),
          new TableCell({ children: [new Paragraph({ text: formatMetricValue(row.memory_increment_mb, 2) })] })
        );
      }

      return new TableRow({ children: cells });
    })
  ];

  // Create table
  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        children: [...paragraphs, table]
      }
    ]
  });

  // Save document
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Main export function for evaluation metrics
 */
const exportEvaluationMetrics = async (
  format: ExportTypes,
  data: MetricData[],
  includePerformance: boolean = true
) => {
  if (!data || data.length === 0) {
    alert('Немає даних для експорту');
    return;
  }
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `model_comparison_${timestamp}`;
  
  const options: EvaluationExportOptions = {
    data,
    fileName,
    title: 'Порівняння моделей - Метрики оцінки',
    includePerformance
  };
  
  try {
    switch (format) {
      case 'xlsx':
        await exportEvaluationToExcel(options);
        break;
      case 'pdf':
        await exportEvaluationToPDF(options);
        break;
      case 'docx':
        await exportEvaluationToWord(options);
        break;
      default:
        alert(`Формат ${format} не підтримується`);
    }
  } catch (error) {
    console.error('Помилка при експорті:', error);
    alert(`Помилка при експорті в ${format}. Перевірте консоль для деталей.`);
  }
};

export const exportEvaluationToXLSX = async (
  data: MetricData[],
  includePerformance: boolean = true
) => {
  return exportEvaluationMetrics('xlsx', data, includePerformance);
};

/**
 * Export evaluation metrics to PDF
 */
export const exportEvaluationToPDF_Quick = async (
  data: MetricData[],
  includePerformance: boolean = true
) => {
  return exportEvaluationMetrics('pdf', data, includePerformance);
};

/**
 * Export evaluation metrics to Word
 */
export const exportEvaluationToDOCX = async (
  data: MetricData[],
  includePerformance: boolean = true
) => {
  return exportEvaluationMetrics('docx', data, includePerformance);
};