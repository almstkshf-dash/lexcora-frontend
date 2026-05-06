'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Printer, X } from 'lucide-react';
import { getEmployeeCashTransactionById } from '@/app/services/api/employeeCashTransactions';
import { toast } from 'react-toastify';
import { DEFAULT_CURRENCY, LOCALE } from '@/app/finance/constants';

const PrintTransactionModal = ({ isOpen, onClose, transactionId }) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('employeeFinance.printModal');
  const printRef = useRef();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId || !isOpen) return;
      
      setLoading(true);
      try {
        const response = await getEmployeeCashTransactionById(transactionId);
        if (response.success) {
          setTransaction(response.data);
        } else {
          toast.error('حدث خطأ في تحميل بيانات العهدة');
          onClose();
        }
      } catch {
        toast.error('حدث خطأ في تحميل بيانات العهدة');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(LOCALE.ar, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        if (n > 0) str += ' و ';
      }
      
      if (n >= 20) {
        str += tens[Math.floor(n / 10)];
        n = n % 10;
        if (n > 0) str += ' و ';
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
    
    const convertHundreds = (n) => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n = n % 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n = n % 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result.trim();
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result.trim();
    };
    
    let result = '';
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    if (intPart >= 1000000) {
      result += convertHundreds(Math.floor(intPart / 1000000)) + ' Million ';
      let remaining = intPart % 1000000;
      if (remaining >= 1000) {
        result += convertHundreds(Math.floor(remaining / 1000)) + ' Thousand ';
        remaining = remaining % 1000;
      }
      if (remaining > 0) {
        result += convertHundreds(remaining) + ' ';
      }
    } else if (intPart >= 1000) {
      result += convertHundreds(Math.floor(intPart / 1000)) + ' Thousand ';
      const remaining = intPart % 1000;
      if (remaining > 0) {
        result += convertHundreds(remaining) + ' ';
      }
    } else {
      result += convertHundreds(intPart) + ' ';
    }
    
    if (decPart > 0) {
      result += 'and ' + convertHundreds(decPart) + ' Fils';
    }
    
    return result.trim();
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=800,height=600');
    
    windowPrint.document.write(`
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8">
        <title>${t('receiptTitle')}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Segoe UI', Tahoma, sans-serif;
            padding: 40px;
            background: white;
            direction: ${isRTL ? 'rtl' : 'ltr'};
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 30px;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          
          .document-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-top: 15px;
            text-decoration: underline;
          }
          
          .document-number {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          
          .content {
            padding: 30px 0;
            margin: 30px 0;
          }
          
          .info-row {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
          }
          
          .info-label-en {
            font-size: 12px;
            color: #6b7280;
            text-align: left;
            font-weight: 600;
          }
          
          .info-label-ar {
            font-size: 13px;
            color: #374151;
            text-align: right;
            font-weight: 600;
          }
          
          .info-value {
            font-size: 15px;
            color: #000;
            text-align: center;
            padding: 8px 15px;
            font-weight: 600;
            border-bottom: 2px dotted #ccc;
          }
          
          .amount-box {
            padding: 30px 0;
            margin: 30px 0;
            text-align: center;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          
          .amount-label {
            font-size: 14px;
            color: #374151;
            font-weight: 700;
            margin-bottom: 15px;
            display: flex;
            justify-content: center;
            gap: 20px;
            align-items: center;
          }
          
          .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            font-family: monospace;
            padding: 15px;
          }
          
          .amount-in-words {
            padding: 20px 0;
            margin: 30px 0;
          }
          
          .words-title {
            font-size: 13px;
            color: #374151;
            font-weight: 700;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .words-ar {
            font-size: 15px;
            color: #1f2937;
            margin-bottom: 8px;
            font-weight: 500;
            line-height: 1.8;
            text-align: right;
          }
          
          .words-en {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
            text-align: left;
          }
          
          .description-box {
            padding: 20px 0;
            margin: 30px 0;
            border-top: 1px solid #e5e7eb;
          }
          
          .description-label {
            font-size: 13px;
            color: #374151;
            font-weight: 700;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .description-text {
            font-size: 14px;
            color: #1f2937;
            white-space: pre-wrap;
            line-height: 1.8;
            min-height: 60px;
            padding: 10px 0;
          }
          
          .signatures {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
          }
          
          .signature-block {
            text-align: center;
          }
          
          .signature-label {
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 80px;
            font-weight: 600;
            font-size: 13px;
            color: #000;
          }
          
          .signature-date {
            margin-top: 3px;
            color: #6b7280;
            font-size: 10px;
          }
          
          .footer {
            margin-top: 40px;
            padding: 15px 0;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .notes {
            padding: 20px 0;
            margin: 30px 0;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #374151;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .container {
              border: none;
            }
            
            @page {
              margin: 20mm;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    
    windowPrint.document.close();
    windowPrint.focus();
    
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-sg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center rounded-t-lg">
            <h2 className="text-xl font-bold text-gray-800" dir="rtl">{t('title')}</h2>
            <div className="flex gap-3">
              <Button 
                onClick={handlePrint} 
              >
                <Printer className="h-4 w-4" />
                {t('print')}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('close')}
              </Button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
            <style jsx>{`
              .info-row {
                display: grid;
                grid-template-columns: 1fr 2fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
                align-items: center;
              }
              .info-label-en {
                font-size: 12px;
                color: #6b7280;
                text-align: left;
                font-weight: 600;
              }
              .info-label-ar {
                font-size: 13px;
                color: #374151;
                text-align: right;
                font-weight: 600;
              }
              .info-value {
                font-size: 15px;
                color: #000;
                text-align: center;
                padding: 8px 15px;
                font-weight: 600;
                border-bottom: 2px dotted #ccc;
              }
              .amount-box {
                padding: 30px 0;
                margin: 30px 0;
                text-align: center;
                border-top: 2px solid #000;
                border-bottom: 2px solid #000;
              }
              .amount-label {
                font-size: 14px;
                color: #374151;
                font-weight: 700;
                margin-bottom: 15px;
                display: flex;
                justify-content: center;
                gap: 20px;
                align-items: center;
              }
              .amount-value {
                font-size: 32px;
                font-weight: bold;
                color: #000;
                font-family: monospace;
                padding: 15px;
              }
              .amount-in-words {
                padding: 20px 0;
                margin: 30px 0;
              }
              .words-title {
                font-size: 13px;
                color: #374151;
                font-weight: 700;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .words-ar {
                font-size: 15px;
                color: #1f2937;
                margin-bottom: 8px;
                font-weight: 500;
                line-height: 1.8;
                text-align: right;
              }
              .words-en {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.6;
                text-align: left;
              }
              .description-box {
                padding: 20px 0;
                margin: 30px 0;
                border-top: 1px solid #e5e7eb;
              }
              .description-label {
                font-size: 13px;
                color: #374151;
                font-weight: 700;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .description-text {
                font-size: 14px;
                color: #1f2937;
                white-space: pre-wrap;
                line-height: 1.8;
                min-height: 60px;
                padding: 10px 0;
              }
              .notes {
                padding: 20px 0;
                margin: 30px 0;
                border-top: 1px solid #e5e7eb;
                font-size: 13px;
                color: #374151;
              }
              .signatures {
                margin-top: 60px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
              }
              .signature-block {
                text-align: center;
              }
              .signature-label {
                border-top: 1px solid #000;
                padding-top: 8px;
                margin-top: 80px;
                font-weight: 600;
                font-size: 13px;
                color: #000;
              }
              .signature-date {
                margin-top: 3px;
                color: #6b7280;
                font-size: 10px;
              }
              .footer {
                margin-top: 40px;
                padding: 15px 0;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              }
            `}</style>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <span className="me-3 text-lg">{t('loading')}</span>
              </div>
            ) : transaction ? (
              <div ref={printRef} className="bg-white shadow-lg" dir="rtl">
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', border: '2px solid #000', padding: '30px' }}>
            {/* Header */}
            <div className="header" style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '20px', marginBottom: '30px' }}>
              <div className="company-name" style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
                {t('companyName')}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {t('companyNameEn')}
              </div>
              <div className="document-title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginTop: '15px', textDecoration: 'underline' }}>
                {t('receiptTitle')}
              </div>
              <div className="document-number" style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                {t('receiptNumber')}: #{transaction.id}
              </div>
            </div>

            {/* Content */}
            <div className="content" style={{ margin: '30px 0', lineHeight: '2' }}>
              {/* Employee Info */}
              <div className="info-row">
                <div className="info-label-en">Employee Name</div>
                <div className="info-value">{transaction.employee_name || '-'}</div>
                <div className="info-label-ar">اسم الموظف</div>
              </div>

              <div className="info-row">
                <div className="info-label-en">Phone Number</div>
                <div className="info-value">{transaction.employee_phone || '-'}</div>
                <div className="info-label-ar">رقم الهاتف</div>
              </div>

              <div className="info-row">
                <div className="info-label-en">Date</div>
                <div className="info-value">{formatDate(transaction.created_at)}</div>
                <div className="info-label-ar">التاريخ</div>
              </div>

              {/* Amount Box */}
              <div className="amount-box">
                <div className="amount-label">
                  <span>Amount Received</span>
                  <span>المبلغ المستلم</span>
                </div>
                <div className="amount-value">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>

              {/* Amount in Words */}
              <div className="amount-in-words">
                <div className="words-title">
                  <span>Amount in Words</span>
                  <span>المبلغ بالحروف</span>
                </div>
                <div className="words-ar">
                  {numberToArabicWords(transaction.amount)} درهم إماراتي فقط لا غير
                </div>
                <div className="words-en">
                  {numberToEnglishWords(transaction.amount)} UAE Dirhams Only
                </div>
              </div>

              {/* Description */}
              {transaction.description && (
                <div className="description-box">
                  <div className="description-label">
                    <span>Description</span>
                    <span>الوصف</span>
                  </div>
                  <div className="description-text">
                    {transaction.description}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="notes">
                <strong>{t('note')}:</strong> {t('noteText')}
              </div>

              {/* Signatures */}
              <div className="signatures">
                <div className="signature-block">
                  <div className="signature-label">
                    <div>{t('recipientSignature')}</div>
                    <div className="signature-date">المستلِم / Recipient</div>
                  </div>
                </div>
                <div className="signature-block">
                  <div className="signature-label">
                    <div>{transaction.created_by_name || '_______________'}</div>
                    <div className="signature-date">المسلِّم / Delivered By</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <div>{t('footerText')}</div>
              <div style={{ marginTop: '5px' }}>{t('createdAt')}: {formatDate(new Date().toISOString())}</div>
              </div>
            </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintTransactionModal;

