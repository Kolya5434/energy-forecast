import type { ExportTypes } from '../types/shared';

interface ExportDataRow {
  name: string;
  value: number;
}

interface ExportOptions {
  data: ExportDataRow[];
  fileName: string;
  title?: string;
  modelName?: string;
}

/**
 * Export data to Excel format (XLSX)
 */
const exportToExcel = async (options: ExportOptions) => {
  // Dynamic import of XLSX library
  const XLSX = await import('xlsx');

  const { data, fileName, title = 'Аналіз важливості ознак', modelName } = options;

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const worksheetData = [
    [title],
    modelName ? [`Модель: ${modelName}`] : [],
    [`Дата: ${new Date().toLocaleDateString('uk-UA')}`],
    [],
    ['№', 'Назва ознаки', 'Важливість', 'Відносна важливість (%)'],
    ...data.map((row, index) => [index + 1, row.name, row.value, ((row.value / totalValue) * 100).toFixed(2) + '%'])
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  worksheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 25 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Важливість ознак');

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Export data to PDF format
 */
const exportToPDF = async (options: ExportOptions) => {
  // Dynamic imports of jsPDF libraries
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  const { data, fileName, modelName } = options;

  const doc = new jsPDF();

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const tableData = data.map((row, index) => [
    (index + 1).toString(),
    row.name,
    row.value.toFixed(4),
    `${((row.value / totalValue) * 100).toFixed(2)}%`
  ]);

  autoTable(doc, {
    startY: 20,
    head: [['#', 'Feature Name', 'Importance', 'Relative Importance (%)']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 40, halign: 'left' },
      3: { cellWidth: 45, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    didDrawPage: (data) => {
      if (data.pageNumber === 1) {
        doc.setFontSize(16);
        doc.text('Feature Importance Analysis', 14, 10);
        
        if (modelName) {
          doc.setFontSize(10);
          doc.text(`Model: ${modelName}`, 14, 16);
        }
      }
    }
  });
  
  const pageCount = doc.getNumberOfPages();
  doc.setPage(pageCount);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 14, doc.internal.pageSize.height - 10);
  
  doc.save(`${fileName}.pdf`);
};

/**
 * Export data to Word format (DOCX)
 */
const exportToWord = async (options: ExportOptions) => {
  // Dynamic import of docx library
  const { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = await import('docx');

  const { data, fileName, title = 'Аналіз важливості ознак', modelName } = options;

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const paragraphs = [
    new Paragraph({
      text: title,
      heading: 'Heading1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  ];

  if (modelName) {
    paragraphs.push(
      new Paragraph({
        text: `Модель: ${modelName}`,
        spacing: { after: 100 }
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      text: `Дата: ${new Date().toLocaleDateString('uk-UA')}`,
      spacing: { after: 300 }
    })
  );

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: '№', bold: true })] })],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Назва ознаки', bold: true })] })],
          width: { size: 45, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Важливість', bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Відносна важливість (%)', bold: true })] })],
          width: { size: 25, type: WidthType.PERCENTAGE }
        })
      ]
    }),
    ...data.map(
      (row, index) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: (index + 1).toString() })]
            }),
            new TableCell({
              children: [new Paragraph({ text: row.name })]
            }),
            new TableCell({
              children: [new Paragraph({ text: row.value.toFixed(4) })]
            }),
            new TableCell({
              children: [new Paragraph({ text: `${((row.value / totalValue) * 100).toFixed(2)}%` })]
            })
          ]
        })
    )
  ];

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });

  const doc = new Document({
    sections: [
      {
        children: [...paragraphs, table]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Main export function
 */
export const handleExport = async (format: ExportTypes, data: ExportDataRow[], modelName?: string) => {
  if (!data || data.length === 0) {
    alert('Немає даних для експорту');
    return;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `feature_importance_${modelName || 'model'}_${timestamp}`;

  const options: ExportOptions = {
    data,
    fileName,
    title: 'Аналіз важливості ознак',
    modelName
  };

  try {
    switch (format) {
      case 'xlsx':
        await exportToExcel(options);
        break;
      case 'pdf':
        await exportToPDF(options);
        break;
      case 'docx':
        await exportToWord(options);
        break;
      default:
        alert(`Формат ${format} не підтримується`);
    }
  } catch (error) {
    console.error('Помилка при експорті:', error);
    alert(`Помилка при експорті в ${format}. Перевірте консоль для деталей.`);
  }
};

export const exportChartData = async (format: ExportTypes, chartData: ExportDataRow[], modelName?: string) => {
  return handleExport(format, chartData, modelName);
};
