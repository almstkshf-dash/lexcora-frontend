"use client";

import { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, Loader2, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAccountStatement } from "@/app/services/api/clientsDeposits";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function AccountStatementTab({ clientId, clientName }) {
  const t = useTranslations("common");
  const tClient = useTranslations("clientFinance");
  const { language } = useLanguage();
  
  // Auto-select current month dates
  const [dateFrom, setDateFrom] = useState(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState(endOfMonth(new Date()));
  const [statementData, setStatementData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!dateFrom || !dateTo) {
      alert(tClient("pleaseSelectDates"));
      return;
    }

    setIsLoading(true);
    try {
      // Format dates to YYYY-MM-DD for the API
      const formattedDateFrom = format(dateFrom, "yyyy-MM-dd");
      const formattedDateTo = format(dateTo, "yyyy-MM-dd");
      
      const response = await getAccountStatement(clientId, formattedDateFrom, formattedDateTo);
      setStatementData(response.data || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching account statement:", error);
      alert(t("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generatePrintContent = () => {
    const totalCredits = statementData
      .filter((item) => item.type === "credit")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const totalDebits = statementData
      .filter((item) => item.type === "debit")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const balance = totalCredits - totalDebits;

    const isRTL = language === "ar";
    
    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <meta charset="UTF-8">
        <title>${tClient("accountStatement")} - ${clientName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            direction: ${isRTL ? 'rtl' : 'ltr'};
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .header .client-info {
            font-size: 16px;
            color: #666;
            margin: 5px 0;
          }
          .date-range {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .type-credit {
            color: #059669;
            font-weight: bold;
          }
          .type-debit {
            color: #dc2626;
            font-weight: bold;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin-top: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-eadius: 8px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
          }
          .summary-value.credit {
            color: #059669;
          }
          .summary-value.debit {
            color: #dc2626;
          }
          .summary-value.balance {
            color: #2563eb;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${tClient("accountStatement")}</h1>
          <div class="client-info">${t("name")}: ${clientName}</div>
          <div class="date-range">
            ${t("fromDate")}: ${format(dateFrom, "yyyy-MM-dd")} | 
            ${t("toDate")}: ${format(dateTo, "yyyy-MM-dd")}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${t("date")}</th>
              <th>${t("type")}</th>
              <th>${t("amount")}</th>
              <th>${t("description")}</th>
            </tr>
          </thead>
          <tbody>
            ${statementData.map(item => `
              <tr>
                <td>${formatDate(item.date)}</td>
                <td class="${item.type === 'credit' ? 'type-credit' : 'type-debit'}">
                  ${tClient(item.type)}
                </td>
                <td>${formatAmount(item.amount)}</td>
                <td>${item.description || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">${tClient("totalCredits")}</div>
            <div class="summary-value credit">${formatAmount(totalCredits)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">${tClient("totalDebits")}</div>
            <div class="summary-value debit">${formatAmount(totalDebits)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">${tClient("balance")}</div>
            <div class="summary-value balance">${formatAmount(balance)}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat(language === "ar" ? "ar-AE" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">
          {tClient("accountStatement")}
        </h3>
      </div>

      {/* Date Filter Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t("fromDate")}
              </label>
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder={t("fromDate")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t("toDate")}
              </label>
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
                placeholder={t("toDate")}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t("loading")}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 me-2" />
                  {t("search")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      {hasSearched && statementData.length > 0 && (
        <div className="flex justify-end mb-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            {t("print") || "طباعة"}
          </Button>
        </div>
      )}
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-center">
                    {t("date")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("type")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("amount")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("description")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasSearched ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">
                          {tClient("selectDatesAndSearch")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    </TableCell>
                  </TableRow>
                ) : statementData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">
                          {t("noData")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  statementData.map((item, index) => (
                    <TableRow key={`${item.source}-${item.id}-${index}`} className="hover:bg-gray-50/50">
                      <TableCell className="text-center">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.type === "credit"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tClient(item.type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {formatAmount(item.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {hasSearched && statementData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-sg">
                <p className="text-sm text-gray-600 mb-1">
                  {tClient("totalCredits")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(
                    statementData
                      .filter((item) => item.type === "credit")
                      .reduce((sum, item) => sum + Number(item.amount), 0)
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-sg">
                <p className="text-sm text-gray-600 mb-1">
                  {tClient("totalDebits")}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatAmount(
                    statementData
                      .filter((item) => item.type === "debit")
                      .reduce((sum, item) => sum + Number(item.amount), 0)
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-sg">
                <p className="text-sm text-gray-600 mb-1">
                  {tClient("balance")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(
                    statementData
                      .filter((item) => item.type === "credit")
                      .reduce((sum, item) => sum + Number(item.amount), 0) -
                      statementData
                        .filter((item) => item.type === "debit")
                        .reduce((sum, item) => sum + Number(item.amount), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


