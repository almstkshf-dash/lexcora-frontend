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

  // Register Arabic-capable font and switch when language is Arabic
  doc.addFileToVFS('NotoSansArabic-Regular.ttf', NOTO_SANS_ARABIC_REGULAR);
  doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
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
  const head = [columns.map((col) => col.label)];
  const body = rows.map((row) =>
    columns.map((col) => {
      const value = row[col.id];
      return value === null || value === undefined ? '' : value;
    })
  );

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

export default exportTableToPDF;
