"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomModal, CustomModalBody, CustomModalFooter } from "@/components/ui/custom-modal";
import { toast } from "react-toastify";
import { getInvoiceById } from "@/app/services/api/invoices";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useTranslations } from "@/hooks/useTranslations";
import { DEFAULT_CURRENCY, CURRENCY_NAMES } from '@/app/finance/constants';

export default function PrintInvoiceModal({ isOpen, onClose, invoiceId }) {
  const t = useTranslations('invoices');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceData();
    }
  }, [isOpen, invoiceId]);

  // Convert number to Arabic words
  const numberToArabicWords = (num) => {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    if (num === 0) return 'صفر';
    
    const convertBelow1000 = (n) => {
      let str = '';
      const hasHundreds = n >= 100;
      
      if (hasHundreds) {
        str += hundreds[Math.floor(n / 100)];
        n = n % 100;
        if (n > 0) str += ' و '; // Add "و" if there are remaining tens/ones
      }
      
      if (n >= 20) {
        str += tens[Math.floor(n / 10)];
        n = n % 10;
        if (n > 0) str += ' و '; // Add "و" between tens and ones
      } else if (n >= 10) {
        str += teens[n - 10];
        return str;
      }
      
      if (n > 0 && n < 10) {
        str += ones[n];
      }
      
      return str;
    };
    
    let result = '';
    let intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    // Millions
    if (intPart >= 1000000) {
      const millions = Math.floor(intPart / 1000000);
      if (millions === 1) result += 'مليون';
      else if (millions === 2) result += 'مليونان';
      else result += convertBelow1000(millions) + ' مليون';
      intPart = intPart % 1000000;
      if (intPart > 0) result += ' و ';
    }
    
    // Thousands
    if (intPart >= 1000) {
      const thousands = Math.floor(intPart / 1000);
      if (thousands === 1) result += 'ألف';
      else if (thousands === 2) result += 'ألفان';
      else if (thousands >= 3 && thousands <= 10) result += convertBelow1000(thousands) + ' آلاف';
      else result += convertBelow1000(thousands) + ' ألف';
      intPart = intPart % 1000;
      if (intPart > 0) result += ' و ';
    }
    
    // Below 1000
    if (intPart > 0) {
      result += convertBelow1000(intPart);
    }
    
    // Decimal part (fils)
    if (decPart > 0) {
      result += ' و ' + convertBelow1000(decPart) + ' فلس';
    }
    
    return result.trim();
  };

  // Convert number to English words
  const numberToEnglishWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    let result = '';
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    if (intPart >= 1000000) {
      result += convertHundreds(Math.floor(intPart / 1000000)) + ' Million ';
      num = intPart % 1000000;
    } else {
      num = intPart;
    }
    
    if (num >= 1000) {
      result += convertHundreds(Math.floor(num / 1000)) + ' Thousand ';
      num = num % 1000;
    }
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num = num % 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num = num % 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      num = 0;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    if (decPart > 0) {
      result += 'and ';
      if (decPart >= 10 && decPart < 20) {
        result += teens[decPart - 10];
      } else {
        if (decPart >= 20) {
          result += tens[Math.floor(decPart / 10)] + ' ';
        }
        if (decPart % 10 > 0) {
          result += ones[decPart % 10];
        }
      }
      result += ' Fils';
    }
    
    return result.trim();
  };

  const convertHundreds = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num = num % 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num = num % 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result.trim();
    }
    if (num > 0) {
      result += ones[num] + ' ';
    }
    return result.trim();
  };

  const getCurrencyName = (currency) => {
    return CURRENCY_NAMES[currency] || { ar: currency, en: currency };
  };

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);
      
      if (response.success) {
        setInvoice(response.data);
      } else {
        toast.error(t('errorLoadingInvoice'));
        onClose();
      }
    } catch (error) {

      toast.error(t('errorLoadingInvoice'));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area');
    if (!printContent) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>فاتورة - ${invoice?.invoice_number || ''}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              padding: 0;
              background: white;
            }
            .invoice-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 10mm;
            }
            .header-section {
              border: 2px solid #1e3a8a;
              padding: 15px;
              margin-bottom: 20px;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
            }
            .company-info {
              text-align: center;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .invoice-title {
              background: white;
              color: #1e3a8a;
              display: inline-block;
              padding: 8px 40px;
              font-size: 24px;
              font-weight: bold;
              border-radius: 5px;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.3);
            }
            .invoice-number {
              font-size: 18px;
              font-weight: bold;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-box {
              border: 1px solid #d1d5db;
              padding: 12px;
              background: #f9fafb;
            }
            .info-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 4px;
              font-weight: 600;
            }
            .info-value {
              font-size: 14px;
              color: #1f2937;
              font-weight: 500;
            }
            .bilingual-label {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .label-ar { font-weight: 600; }
            .label-en { font-size: 10px; color: #6b7280; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 1px solid #d1d5db;
            }
            thead {
              background: #1e3a8a;
              color: white;
            }
            th {
              padding: 12px 8px;
              text-align: center;
              font-weight: 600;
              font-size: 12px;
              border: 1px solid #1e3a8a;
            }
            td {
              padding: 10px 8px;
              border: 1px solid #d1d5db;
              font-size: 13px;
            }
            tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            .amount-cell {
              text-align: end;
              font-family: monospace;
              font-weight: 600;
            }
            .totals-section {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 350px;
              border: 2px solid #1e3a8a;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            .total-row.subtotal {
              background: #f3f4f6;
            }
            .total-row.vat {
              background: #fef3c7;
            }
            .total-row.grand-total {
              background: #1e3a8a;
              color: white;
              font-size: 16px;
              font-weight: bold;
              border-bottom: none;
            }
            .amount-in-words {
              border: 2px solid #e5e7eb;
              padding: 15px;
              margin: 20px 0;
              background: #fffbeb;
            }
            .words-title {
              font-size: 12px;
              color: #92400e;
              font-weight: 600;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .words-ar {
              font-size: 14px;
              color: #1f2937;
              margin-bottom: 5px;
              font-weight: 500;
            }
            .words-en {
              font-size: 12px;
              color: #6b7280;
              font-style: italic;
            }
            .footer-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #d1d5db;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin-top: 40px;
            }
            .signature-box {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #1f2937;
              padding-top: 5px;
              margin-top: 50px;
              font-size: 12px;
              color: #6b7280;
            }
            .thank-you {
              text-align: center;
              margin-top: 30px;
              padding: 15px;
              background: #f3f4f6;
              border-radius: 5px;
            }
            .thank-you-ar {
              font-size: 16px;
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 3px;
            }
            .thank-you-en {
              font-size: 12px;
              color: #6b7280;
            }
            @media print {
              body { padding: 0; }
              .invoice-container { padding: 5mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
    return new Intl.NumberFormat('ar-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: t('statusPending'),
      approved: t('statusApproved'),
      rejected: t('statusRejected'),
    };
    return statusLabels[status] || status;
  };

  if (!isOpen) return null;

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title={t('printInvoice')}
        size="lg"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="me-3">{t('loadingData')}</span>
          </div>
        ) : invoice ? (
          <>
            <CustomModalBody>
              {/* Print Area */}
              <style jsx>{`
                .invoice-container {
                  max-width: 210mm;
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                }
                .header-section {
                  border: 2px solid #1e3a8a;
                  padding: 15px;
                  margin-bottom: 20px;
                  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                  color: white;
                  border-radius: 5px;
                }
                .company-info {
                  text-align: center;
                  margin-bottom: 10px;
                }
                .company-name {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .invoice-title {
                  background: white;
                  color: #1e3a8a;
                  display: inline-block;
                  padding: 8px 40px;
                  font-size: 20px;
                  font-weight: bold;
                  border-radius: 5px;
                }
                .invoice-details {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 10px;
                  padding-top: 10px;
                  border-top: 1px solid rgba(255,255,255,0.3);
                }
                .invoice-number {
                  font-size: 16px;
                  font-weight: bold;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 20px;
                }
                .info-box {
                  border: 1px solid #d1d5db;
                  padding: 12px;
                  background: #f9fafb;
                  border-radius: 4px;
                }
                .info-label {
                  font-size: 11px;
                  color: #6b7280;
                  text-transform: uppercase;
                  margin-bottom: 4px;
                  font-weight: 600;
                }
                .info-value {
                  font-size: 14px;
                  color: #1f2937;
                  font-weight: 500;
                }
                .bilingual-label {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 5px;
                }
                .label-ar { 
                  font-weight: 600;
                  font-size: 13px;
                }
                .label-en { 
                  font-size: 10px;
                  color: #6b7280;
                }
                .invoice-container table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  border: 1px solid #d1d5db;
                }
                .invoice-container thead {
                  background: #1e3a8a;
                  color: white;
                }
                .invoice-container th {
                  padding: 12px 8px;
                  text-align: center;
                  font-weight: 600;
                  font-size: 13px;
                  border: 1px solid #1e3a8a;
                }
                .invoice-container td {
                  padding: 10px 8px;
                  border: 1px solid #d1d5db;
                  font-size: 13px;
                }
                .invoice-container tbody tr:nth-child(even) {
                  background: #f9fafb;
                }
                .amount-cell {
                  text-align: end;
                  font-family: monospace;
                  font-weight: 600;
                }
                .totals-section {
                  margin-top: 20px;
                  display: flex;
                  justify-content: flex-end;
                }
                .totals-box {
                  width: 350px;
                  border: 2px solid #1e3a8a;
                  border-radius: 5px;
                  overflow: hidden;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 15px;
                  border-bottom: 1px solid #e5e7eb;
                }
                .total-row.subtotal {
                  background: #f3f4f6;
                }
                .total-row.vat {
                  background: #fef3c7;
                }
                .total-row.grand-total {
                  background: #1e3a8a;
                  color: white;
                  font-size: 16px;
                  font-weight: bold;
                  border-bottom: none;
                }
                .amount-in-words {
                  border: 2px solid #e5e7eb;
                  padding: 15px;
                  margin: 20px 0;
                  background: #fffbeb;
                  border-radius: 5px;
                }
                .words-title {
                  font-size: 12px;
                  color: #92400e;
                  font-weight: 600;
                  margin-bottom: 8px;
                  text-transform: uppercase;
                }
                .words-ar {
                  font-size: 14px;
                  color: #1f2937;
                  margin-bottom: 5px;
                  font-weight: 500;
                }
                .words-en {
                  font-size: 12px;
                  color: #6b7280;
                  font-style: italic;
                }
                .footer-section {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #d1d5db;
                }
                .signatures {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 20px;
                  margin-top: 40px;
                }
                .signature-box {
                  text-align: center;
                }
                .signature-line {
                  border-top: 1px solid #1f2937;
                  padding-top: 5px;
                  margin-top: 50px;
                  font-size: 12px;
                  color: #6b7280;
                }
                .thank-you {
                  text-align: center;
                  margin-top: 30px;
                  padding: 15px;
                  background: #f3f4f6;
                  border-radius: 5px;
                }
                .thank-you-ar {
                  font-size: 16px;
                  font-weight: 600;
                  color: #1e3a8a;
                  margin-bottom: 3px;
                }
                .thank-you-en {
                  font-size: 12px;
                  color: #6b7280;
                }
              `}</style>
              <div id="invoice-print-area" ref={printRef} className="invoice-container">
                {/* Header Section */}
                <div className="header-section">
                  <div className="company-info">
                    <div className="company-name">{t('companyNameAr')}</div>
                    <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                      {t('companyNameEn')}
                    </div>
                    <div className="invoice-title">
                      فاتورة / INVOICE
                    </div>
                  </div>
                  <div className="invoice-details">
                    <div>
                      <div style={{ fontSize: '11px', marginBottom: '3px' }}>رقم الفاتورة / Invoice No.</div>
                      <div className="invoice-number">{invoice.invoice_number}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', marginBottom: '3px' }}>التاريخ / Date</div>
                      <div className="invoice-number">{formatDate(invoice.invoice_date)}</div>
                    </div>
                  </div>
                </div>

                {/* Client and Details Info */}
                <div className="info-grid">
                  <div className="info-box">
                    <div className="bilingual-label">
                      <span className="label-ar">إلى / To</span>
                    </div>
                    <div className="info-value">{invoice.client_name || 'غير محدد / Not Specified'}</div>
                  </div>
                  <div className="info-box">
                    <div className="bilingual-label">
                      <span className="label-ar">الفرع / Branch</span>
                    </div>
                    <div className="info-value">{invoice.branch_name || '-'}</div>
                  </div>
                  <div className="info-box">
                    <div className="bilingual-label">
                      <span className="label-ar">العملة / Currency</span>
                    </div>
                    <div className="info-value">{getCurrencyName(invoice.currency || 'AED').ar} / {getCurrencyName(invoice.currency || 'AED').en}</div>
                  </div>
                  {invoice.bank_name && (
                    <>
                      <div className="info-box">
                        <div className="bilingual-label">
                          <span className="label-ar">البنك / Bank</span>
                        </div>
                        <div className="info-value">{invoice.bank_name}</div>
                      </div>
                      <div className="info-box">
                        <div className="bilingual-label">
                          <span className="label-ar">رقم الحساب / Account No.</span>
                        </div>
                        <div className="info-value">{invoice.account_number}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Items Table */}
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        #<br/>
                        <span style={{ fontSize: '9px', fontWeight: 'normal' }}>No.</span>
                      </th>
                      <th>
                        الوصف<br/>
                        <span style={{ fontSize: '9px', fontWeight: 'normal' }}>Description</span>
                      </th>
                      <th style={{ width: '150px' }}>
                        المبلغ<br/>
                        <span style={{ fontSize: '9px', fontWeight: 'normal' }}>Amount ({invoice.currency || 'AED'})</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td style={{ textAlign: 'center' }}>{index + 1}</td>
                          <td>{item.description}</td>
                          <td className="amount-cell">
                            {formatCurrency(item.amount, invoice.currency)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                          {t('noItems')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="totals-section">
                  <div className="totals-box">
                    <div className="total-row subtotal">
                      <span>المجموع الفرعي / Subtotal</span>
                      <span className="amount-cell">
                        {formatCurrency(
                          invoice.items?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0,
                          invoice.currency
                        )}
                      </span>
                    </div>
                    {invoice.vat > 0 && (
                      <div className="total-row vat">
                        <span>ضريبة القيمة المضافة ({invoice.vat}%) / VAT</span>
                        <span className="amount-cell">
                          {formatCurrency(
                            ((invoice.items?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0) * invoice.vat) / 100,
                            invoice.currency
                          )}
                        </span>
                      </div>
                    )}
                    <div className="total-row grand-total">
                      <span>الإجمالي / TOTAL</span>
                      <span className="amount-cell" style={{ fontSize: '18px' }}>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount in Words */}
                <div className="amount-in-words">
                  <div className="words-title">المبلغ بالحروف / Amount in Words</div>
                  <div className="words-ar">
                    {numberToArabicWords(invoice.amount)} {getCurrencyName(invoice.currency || 'AED').ar}
                  </div>
                  <div className="words-en">
                    {numberToEnglishWords(invoice.amount)} {getCurrencyName(invoice.currency || 'AED').en} Only
                  </div>
                </div>

                {/* Footer Section */}
                <div className="footer-section">
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '5px' }}>
                    <strong>أضيف بواسطة / Created By:</strong> {invoice.created_by_name || '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    <strong>تاريخ الإصدار / Issue Date:</strong> {formatDate(invoice.created_at)}
                  </div>

                  {/* Signatures */}
                  <div className="signatures">
                    <div className="signature-box">
                      <div className="signature-line">
                        <div>المحاسب</div>
                        <div style={{ fontSize: '10px' }}>Accountant</div>
                      </div>
                    </div>
                    <div className="signature-box">
                      <div className="signature-line">
                        <div>المدير المالي</div>
                        <div style={{ fontSize: '10px' }}>Financial Manager</div>
                      </div>
                    </div>
                    <div className="signature-box">
                      <div className="signature-line">
                        <div>المدير العام</div>
                        <div style={{ fontSize: '10px' }}>General Manager</div>
                      </div>
                    </div>
                  </div>

                  {/* Thank You */}
                  <div className="thank-you">
                    <div className="thank-you-ar">شكراً لتعاملكم معنا</div>
                    <div className="thank-you-en">Thank you for your business</div>
                  </div>
                </div>
              </div>
            </CustomModalBody>

            <CustomModalFooter>
              <Button variant="outline" onClick={onClose}>
                {t('close')}
              </Button>
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                {t('print')}
              </Button>
            </CustomModalFooter>
          </>
        ) : (
          <div className="p-12 text-center">
            {t('noInvoiceData')}
          </div>
        )}
      </CustomModal>
    </>
  );
}

