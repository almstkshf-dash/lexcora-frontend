// Shared PDF export helper for tabular data using lazy-loaded jsPDF + autoTable
// Keeps all PDF logic in one place (headers, footers, watermark) so buttons stay thin.
import { NOTO_SANS_ARABIC_REGULAR } from './fonts/NotoSansArabicRegular';

export const exportTableToPDF = async ({
  rows = [],
  columns = [],
  title = 'Report',
  language = 'en',
  watermarkText = 'Lexcora',
  filename = 'export.pdf'
}) => {
  if (!rows || rows.length === 0 || !columns || columns.length === 0) {
    throw new Error(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
  }

  // Lazy-load heavy deps only when exporting
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Register Arabic-capable font (both normal + bold) so autoTable headStyles don't fall back to helvetica
  doc.addFileToVFS('NotoSansArabic-Regular.ttf', NOTO_SANS_ARABIC_REGULAR);
  doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
  doc.addFileToVFS('NotoSansArabic-Bold.ttf', NOTO_SANS_ARABIC_REGULAR);
  doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'bold');
  if (language === 'ar') {
    doc.setFont('NotoSansArabic', 'normal');
  }

  // Header
  const resolvedTitle = title || 'Report';
  doc.setFontSize(16);
  doc.text(resolvedTitle, doc.internal.pageSize.width / 2, 16, {
    align: 'center'
  });

  // Watermark
  if (watermarkText) {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(48);
    doc.setFont(language === 'ar' ? 'NotoSansArabic' : 'helvetica', 'bold');
    const watermarkX = doc.internal.pageSize.width / 2;
    const watermarkY = doc.internal.pageSize.height / 2;
    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: 0.08 }));
    doc.text(watermarkText, watermarkX, watermarkY, {
      align: 'center',
      angle: -25
    });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);
    doc.setFont(language === 'ar' ? 'NotoSansArabic' : 'helvetica', 'normal');
  }

  // Table
  let head = [columns.map((col) => col.label)];
  let body = rows.map((row) =>
    columns.map((col) => {
      const value = row[col.id];
      return value === null || value === undefined ? '' : value;
    })
  );

  // For Arabic (RTL), we need to reverse the order of columns so they read Right-to-Left
  if (language === 'ar') {
    head = [head[0].reverse()];
    body = body.map(row => row.reverse());
  }

  autoTable(doc, {
    head,
    body,
    startY: 26,
    styles: {
      font: language === 'ar' ? 'NotoSansArabic' : 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      halign: language === 'ar' ? 'right' : 'left'
    },
    headStyles: {
      font: language === 'ar' ? 'NotoSansArabic' : 'helvetica',
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 26, right: 10, bottom: 16, left: 10 }
  });

  // Footer
  const timestamp = new Date().toLocaleDateString(language === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(language === 'ar' ? 'NotoSansArabic' : 'helvetica', 'normal');
    doc.text(
      `${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}`,
      10,
      doc.internal.pageSize.height - 8,
      { align: 'left' }
    );
    doc.text(
      `${language === 'ar' ? 'صفحة' : 'Page'} ${i} ${language === 'ar' ? 'من' : 'of'} ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 8,
      { align: 'left' }
    );
  }

  doc.save(filename);
};

export const exportVatReturnToPDF = async ({
  data = {},
  language = 'ar',
  translations = {}
}) => {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Register Arabic-capable font (both normal + bold)
  doc.addFileToVFS('NotoSansArabic-Regular.ttf', NOTO_SANS_ARABIC_REGULAR);
  doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
  doc.addFileToVFS('NotoSansArabic-Bold.ttf', NOTO_SANS_ARABIC_REGULAR);
  doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'bold');
  
  const isAr = language === 'ar';
  doc.setFont('NotoSansArabic', 'normal');

  // Title
  doc.setFontSize(18);
  doc.setFont('NotoSansArabic', 'bold');
  doc.text(translations.reportTitle || 'VAT Return', doc.internal.pageSize.width / 2, 18, {
    align: 'center'
  });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('NotoSansArabic', 'normal');
  doc.text(translations.reportSubtitle || '', doc.internal.pageSize.width / 2, 24, {
    align: 'center'
  });

  // Reporting Period
  const periodStart = data?.reportingPeriod?.start_date || 'N/A';
  const periodEnd = data?.reportingPeriod?.end_date || 'N/A';
  const periodText = `${translations.taxPeriod || 'Tax Period'}: ${periodStart} - ${periodEnd}`;
  doc.setFontSize(9);
  doc.text(periodText, doc.internal.pageSize.width / 2, 30, {
    align: 'center'
  });

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.line(15, 34, doc.internal.pageSize.width - 15, 34);

  // Section 1: Output Tax
  doc.setFontSize(12);
  doc.setFont('NotoSansArabic', 'bold');
  doc.text(translations.outputTax || 'Output Tax', isAr ? doc.internal.pageSize.width - 15 : 15, 42, {
    align: isAr ? 'right' : 'left'
  });

  // Output Tax Table Columns & Data
  const outColumns = [
    { header: translations.descriptionEmirates || 'Emirate', dataKey: 'desc' },
    { header: translations.taxableAmount || 'Taxable Amount', dataKey: 'amount' },
    { header: translations.vatAmount || 'VAT Amount', dataKey: 'vat' },
    { header: translations.adjustments || 'Adjustments', dataKey: 'adj' }
  ];

  // Standard rated supplies rows
  const outRows = [];
  const formatVal = (val) => (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (Array.isArray(data?.outputTax?.standardRatedSupplies)) {
    data.outputTax.standardRatedSupplies.forEach(item => {
      outRows.push({
        desc: item.emirate,
        amount: formatVal(item.amount),
        vat: formatVal(item.vat_amount),
        adj: '0.00'
      });
    });
  }

  // Add Zero Rated & Exempt
  outRows.push({
    desc: translations.zeroRatedSupplies || 'Zero Rated',
    amount: formatVal(data?.outputTax?.zeroRatedSupplies),
    vat: '0.00',
    adj: '-'
  });
  outRows.push({
    desc: translations.exemptSupplies || 'Exempt',
    amount: formatVal(data?.outputTax?.exemptSupplies),
    vat: '0.00',
    adj: '-'
  });

  // Add Total Row
  outRows.push({
    desc: translations.totalOutputTax || 'Total Output Tax',
    amount: formatVal(data?.outputTax?.totalOutputAmount),
    vat: formatVal(data?.outputTax?.totalOutputVat),
    adj: '0.00',
    isTotal: true
  });

  let currentY = 46;

  // Draw Output Tax Table
  autoTable(doc, {
    columns: isAr ? [...outColumns].reverse() : outColumns,
    body: outRows.map(row => {
      if (isAr) {
        return [row.adj, row.vat, row.amount, row.desc];
      }
      return [row.desc, row.amount, row.vat, row.adj];
    }),
    startY: currentY,
    margin: { left: 15, right: 15 },
    styles: {
      font: 'NotoSansArabic',
      fontSize: 8,
      cellPadding: 2,
      halign: isAr ? 'right' : 'left'
    },
    headStyles: {
      fillColor: [14, 116, 144], // Cyan/Primary color
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    didParseCell: function(dataCell) {
      const rowIndex = dataCell.row.index;
      if (rowIndex === outRows.length - 1) {
        dataCell.cell.styles.fontStyle = 'bold';
        dataCell.cell.styles.fillColor = [240, 249, 255]; // Light blue
        if (dataCell.column.index === (isAr ? 1 : 2)) {
          dataCell.cell.styles.textColor = [14, 116, 144]; // Highlight VAT total
        }
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Section 2: Input Tax
  doc.setFontSize(12);
  doc.setFont('NotoSansArabic', 'bold');
  doc.text(translations.inputTax || 'Input Tax', isAr ? doc.internal.pageSize.width - 15 : 15, currentY, {
    align: isAr ? 'right' : 'left'
  });

  currentY += 4;

  const inColumns = [
    { header: translations.description || 'Description', dataKey: 'desc' },
    { header: translations.taxableAmount || 'Taxable Amount', dataKey: 'amount' },
    { header: translations.recoverableVat || 'Recoverable VAT', dataKey: 'vat' },
    { header: translations.adjustments || 'Adjustments', dataKey: 'adj' }
  ];

  const inRows = [
    {
      desc: translations.standardRatedExpenses || 'Standard Rated Expenses',
      amount: formatVal(data?.inputTax?.standardRatedExpenses),
      vat: formatVal(data?.inputTax?.recoverableVat),
      adj: '0.00'
    },
    {
      desc: translations.totalInputTax || 'Total Input Tax',
      amount: formatVal(data?.inputTax?.standardRatedExpenses),
      vat: formatVal(data?.inputTax?.recoverableVat),
      adj: '0.00',
      isTotal: true
    }
  ];

  autoTable(doc, {
    columns: isAr ? [...inColumns].reverse() : inColumns,
    body: inRows.map(row => {
      if (isAr) {
        return [row.adj, row.vat, row.amount, row.desc];
      }
      return [row.desc, row.amount, row.vat, row.adj];
    }),
    startY: currentY,
    margin: { left: 15, right: 15 },
    styles: {
      font: 'NotoSansArabic',
      fontSize: 8,
      cellPadding: 3,
      halign: isAr ? 'right' : 'left'
    },
    headStyles: {
      fillColor: [239, 68, 68], // Red accent for Input Tax
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    didParseCell: function(dataCell) {
      const rowIndex = dataCell.row.index;
      if (rowIndex === inRows.length - 1) {
        dataCell.cell.styles.fontStyle = 'bold';
        dataCell.cell.styles.fillColor = [254, 242, 242]; // Light red
        if (dataCell.column.index === (isAr ? 1 : 2)) {
          dataCell.cell.styles.textColor = [239, 68, 68];
        }
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, doc.internal.pageSize.width - 30, 26, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, doc.internal.pageSize.width - 30, 26, 'S');

  // Summary Title
  doc.setFontSize(10);
  doc.setFont('NotoSansArabic', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(translations.netVatPayable || 'Net VAT Payable', isAr ? doc.internal.pageSize.width - 25 : 25, currentY + 8, {
    align: isAr ? 'right' : 'left'
  });

  // Summary Value
  doc.setFontSize(18);
  doc.setFont('NotoSansArabic', 'bold');
  const netVatVal = data?.netVat || 0;
  const netVatColor = netVatVal >= 0 ? [14, 116, 144] : [22, 163, 74];
  doc.setTextColor(netVatColor[0], netVatColor[1], netVatColor[2]);
  const netVatText = `${formatVal(Math.abs(netVatVal))} ${translations.currencySymbol || 'AED'}`;
  doc.text(netVatText, isAr ? doc.internal.pageSize.width - 25 : 25, currentY + 16, {
    align: isAr ? 'right' : 'left'
  });

  // Summary Subtext
  doc.setFontSize(8);
  doc.setFont('NotoSansArabic', 'normal');
  doc.setTextColor(100, 116, 139);
  const subText = netVatVal >= 0 ? (translations.payableToFta || 'Payable to FTA') : (translations.creditBalance || 'Credit Balance');
  doc.text(subText, isAr ? doc.internal.pageSize.width - 25 : 25, currentY + 22, {
    align: isAr ? 'right' : 'left'
  });

  // Footer
  const timestamp = new Date().toLocaleDateString(isAr ? 'ar' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('NotoSansArabic', 'normal');
  doc.text(
    `${translations.exportDate || 'Export Date'}: ${timestamp}`,
    15,
    doc.internal.pageSize.height - 10,
    { align: 'left' }
  );

  doc.text(
    `${translations.page || 'Page'} 1 ${translations.of || 'of'} 1`,
    doc.internal.pageSize.width - 15,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );

  const fileBase = translations.reportTitle ? translations.reportTitle.replace(/\s+/g, '_') : 'VAT_Declaration';
  const filename = `${fileBase}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export default exportTableToPDF;
