"use client";

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { 
  getSalaries, 
  processPayroll, 
  paySalary,
  getSalaryById
} from '@/app/services/api/salaries';
import { getEmployees } from '@/app/services/api/employees';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Search,
  Plus,
  Loader2,
  FileText,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function PayrollPage() {
  const { t } = useTranslations();
  const { isRTL, language } = useLanguage();
  
  const [filters, setFilters] = useState({
    payPeriod: format(new Date(), 'yyyy-MM'),
    status: ''
  });
  
  const { data: salariesData, error: salariesError, mutate: mutateSalaries, isLoading: salariesLoading } = useSWR(
    ['/salaries', filters],
    () => getSalaries(filters)
  );
  
  const { data: employeesData } = useSWR('/employees', getEmployees);
  const employees = useMemo(() => employeesData?.data || [], [employeesData]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPeriod, setProcessingPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [batchData, setBatchData] = useState([]);

  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedSalaryDetails, setSelectedSalaryDetails] = useState(null);
  const [isSlipLoading, setIsSlipLoading] = useState(false);

  const handlePaySalary = async (salaryId) => {
    try {
      await paySalary(salaryId, { paymentDate: new Date() });
      toast.success(t('payroll.salaryPaid'));
      mutateSalaries();
    } catch (error) {
      toast.error(t('payroll.errorPayingSalary'));
    }
  };

  const handleViewSlip = async (salaryId) => {
    setIsSlipLoading(true);
    setIsSlipModalOpen(true);
    try {
      const response = await getSalaryById(salaryId);
      const salaryDetails = response.data || response;
      setSelectedSalaryDetails(salaryDetails);
    } catch (error) {
      toast.error(t('common.errorLoading') || 'Error loading slip details');
      setIsSlipModalOpen(false);
    } finally {
      setIsSlipLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-slip');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, uniqueName, 'left=50,top=50,width=800,height=900,toolbar=0,scrollbars=1,status=0');
    
    const isRtl = language === 'ar';
    const direction = isRtl ? 'rtl' : 'ltr';
    const textAlignment = isRtl ? 'right' : 'left';

    printWindow.document.write(`
      <html>
        <head>
          <title>${t('payroll.slipTitle')}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              direction: ${direction};
              text-align: ${textAlignment};
              padding: 40px;
              color: #1a202c;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h2 {
              font-size: 24px;
              margin: 0 0 10px 0;
              color: #2b6cb0;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .section {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              background-color: #f7fafc;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 10px;
              margin-bottom: 15px;
              color: #2d3748;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .row-bold {
              font-weight: bold;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              margin-top: 15px;
              font-size: 16px;
            }
            .bank-info {
              border: 1px dashed #cbd5e0;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
              background-color: #fff;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              font-size: 12px;
              color: #718096;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    if (isProcessingModalOpen && employees.length > 0) {
      const activeEmployees = employees.filter(e => e.status === 'active');
      setBatchData(activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        employee_number: emp.job_id || emp.eId,
        incentives: 0,
        bonuses: 0,
        overtime: 0,
        notes: ""
      })));
    }
  }, [isProcessingModalOpen, employees]);

  const handleProcessBatch = async () => {
    setIsProcessing(true);
    try {
      let successCount = 0;
      for (const item of batchData) {
        try {
          await processPayroll({
            employeeId: item.id,
            payPeriod: processingPeriod,
            extraData: { 
              incentives: item.incentives, 
              bonuses: item.bonuses,
              overtimeAmount: item.overtime,
              notes: item.notes 
            }
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to process ${item.name}:`, err);
        }
      }
      
      toast.success(t('payroll.payrollProcessed', { count: successCount }));
      mutateSalaries();
      setIsProcessingModalOpen(false);
    } catch (error) {
      toast.error(t('payroll.errorProcessingPayroll'));
    } finally {
      setIsProcessing(false);
    }
  };

  const updateBatchItem = (id, field, value) => {
    setBatchData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const salaries = salariesData?.data || [];

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-primary" />
          {t('payroll.title')}
        </h1>
        
        <div className="flex gap-3">
          <Input 
            type="month" 
            value={processingPeriod} 
            onChange={(e) => setProcessingPeriod(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => setIsProcessingModalOpen(true)}>
            <Plus className="w-4 h-4 me-2" />
            {t('payroll.processBatch')}
          </Button>
        </div>
      </div>

      {/* Batch Processing Modal */}
      {isProcessingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsProcessingModalOpen(false)} />
          <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>{t('payroll.processFor')}: {processingPeriod}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('employees.employee')}</TableHead>
                    <TableHead>{t('payroll.incentives')}</TableHead>
                    <TableHead>{t('payroll.bonuses')}</TableHead>
                    <TableHead>{t('payroll.overtime')}</TableHead>
                    <TableHead>{t('common.notes')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchData.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name}
                        <div className="text-xs text-muted-foreground">{item.employee_number}</div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.incentives} 
                          onChange={(e) => updateBatchItem(item.id, 'incentives', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.bonuses} 
                          onChange={(e) => updateBatchItem(item.id, 'bonuses', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.overtime} 
                          onChange={(e) => updateBatchItem(item.id, 'overtime', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.notes} 
                          onChange={(e) => updateBatchItem(item.id, 'notes', e.target.value)}
                          placeholder={t('common.notes')}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <Button variant="outline" onClick={() => setIsProcessingModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleProcessBatch} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <CheckCircle className="w-4 h-4 me-2" />}
                {t('payroll.confirmProcess')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              {t('payroll.totalEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-orange-600" />
              {t('payroll.pendingPayments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaries.filter(s => s.status === 'processed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('payroll.paidThisMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {salaries.filter(s => s.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('payroll.history')}</CardTitle>
            <div className="flex gap-3">
              <Input 
                type="month" 
                value={filters.payPeriod} 
                onChange={(e) => setFilters({...filters, payPeriod: e.target.value})}
                className="w-40"
              />
              <Select 
                value={filters.status} 
                onValueChange={(val) => setFilters({...filters, status: val})}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('common.allStatus') || 'كل الحالات'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processed">{t('payroll.statusProcessed') || 'تمت المعالجة'}</SelectItem>
                  <SelectItem value="paid">{t('payroll.statusPaid') || 'تم الدفع'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employees.employee') || 'الموظف'}</TableHead>
                  <TableHead>{t('payroll.period') || 'الفترة'}</TableHead>
                  <TableHead>{t('payroll.baseSalary') || 'الراتب الأساسي'}</TableHead>
                  <TableHead>{t('payroll.allowances') || 'البدلات'}</TableHead>
                  <TableHead>{t('payroll.deductions') || 'الاستقطاعات'}</TableHead>
                  <TableHead>{t('payroll.netSalary') || 'صافي الراتب'}</TableHead>
                  <TableHead>{t('common.status') || 'الحالة'}</TableHead>
                  <TableHead className="text-center">{t('common.actions') || 'الإجراءات'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salariesLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : salaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      {t('common.noDataFound') || 'لا توجد بيانات'}
                    </TableCell>
                  </TableRow>
                ) : (
                  salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">
                        <div>{salary.employee_name}</div>
                        <div className="text-xs text-muted-foreground">{salary.employee_number}</div>
                      </TableCell>
                      <TableCell>{salary.pay_period}</TableCell>
                      <TableCell>{parseFloat(salary.base_salary).toLocaleString()} AED</TableCell>
                      <TableCell className="text-green-600">+{parseFloat(salary.allowances).toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-{parseFloat(salary.deductions).toLocaleString()}</TableCell>
                      <TableCell className="font-bold">{parseFloat(salary.net_salary).toLocaleString()} AED</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          salary.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {salary.status === 'paid' ? t('payroll.statusPaid') : t('payroll.statusProcessed')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {salary.status === 'processed' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePaySalary(salary.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="w-4 h-4 me-2" />
                              {t('payroll.payNow')}
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewSlip(salary.id)}
                          >
                            <FileText className="w-4 h-4 me-2" />
                            {t('payroll.viewSlip')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Detail Modal */}
      {isSlipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSlipModalOpen(false)} />
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t('payroll.slipTitle') || 'تفاصيل كشف الراتب'}
                </CardTitle>
                <div className="flex gap-2">
                  {selectedSalaryDetails && (
                    <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {t('payroll.slipPrint') || 'Print'}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setIsSlipModalOpen(false)}>
                    {t('payroll.slipClose') || 'Close'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 p-6 space-y-6">
              {isSlipLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : selectedSalaryDetails ? (
                <div id="printable-slip" className="space-y-6">
                  {/* Header/Info section */}
                  <div className="header border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{selectedSalaryDetails.employee_name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedSalaryDetails.employee_number}</p>
                        {(selectedSalaryDetails.department_ar || selectedSalaryDetails.department_en) && (
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' 
                              ? selectedSalaryDetails.department_ar 
                              : selectedSalaryDetails.department_en}
                          </p>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-sm font-semibold">{t('payroll.slipPeriod')}</div>
                        <div className="text-lg font-bold text-primary">
                          {selectedSalaryDetails.pay_period 
                            ? selectedSalaryDetails.pay_period.substring(0, 7) 
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earning & Deduction Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Earnings Section */}
                    <div className="section border rounded-lg p-4 bg-gray-50/50">
                      <h3 className="section-title text-sm font-bold border-b pb-2 mb-3 text-foreground flex justify-between">
                        <span>{t('payroll.earnings')}</span>
                        <span className="text-xs text-muted-foreground">(AED)</span>
                      </h3>
                      <div className="space-y-2">
                        <div className="row flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('payroll.baseSalary')}</span>
                          <span className="font-medium">{parseFloat(selectedSalaryDetails.base_salary || 0).toFixed(2)}</span>
                        </div>
                        {parseFloat(selectedSalaryDetails.housing_allowance || 0) > 0 && (
                          <div className="row flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('payroll.slipHousing')}</span>
                            <span className="font-medium">{parseFloat(selectedSalaryDetails.housing_allowance).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(selectedSalaryDetails.transportation_allowance || 0) > 0 && (
                          <div className="row flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('payroll.slipTrans')}</span>
                            <span className="font-medium">{parseFloat(selectedSalaryDetails.transportation_allowance).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(selectedSalaryDetails.other_allowance || 0) > 0 && (
                          <div className="row flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('payroll.slipOther')}</span>
                            <span className="font-medium">{parseFloat(selectedSalaryDetails.other_allowance).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(selectedSalaryDetails.incentives || 0) > 0 && (
                          <div className="row flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('payroll.slipIncentives')}</span>
                            <span className="font-medium">{parseFloat(selectedSalaryDetails.incentives).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(selectedSalaryDetails.bonuses || 0) > 0 && (
                          <div className="row flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('payroll.slipBonuses')}</span>
                            <span className="font-medium">{parseFloat(selectedSalaryDetails.bonuses).toFixed(2)}</span>
                          </div>
                        )}
                        {parseFloat(selectedSalaryDetails.overtime_amount || 0) > 0 && (
                          <div className="row flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('payroll.slipOvertime')}</span>
                            <span className="font-medium">{parseFloat(selectedSalaryDetails.overtime_amount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="row-bold flex justify-between font-bold border-t pt-2 mt-3 text-sm">
                          <span>{t('payroll.slipAllowances')}</span>
                          <span>{parseFloat(selectedSalaryDetails.allowances || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions & Summary Section */}
                    <div className="section border rounded-lg p-4 bg-gray-50/50">
                      <h3 className="section-title text-sm font-bold border-b pb-2 mb-3 text-foreground flex justify-between">
                        <span>{t('payroll.slipDeductions')}</span>
                        <span className="text-xs text-muted-foreground">(AED)</span>
                      </h3>
                      <div className="space-y-2">
                        <div className="row flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('payroll.deductions')}</span>
                          <span className="font-medium text-red-600">-{parseFloat(selectedSalaryDetails.deductions || 0).toFixed(2)}</span>
                        </div>
                        <div className="row-bold flex justify-between font-bold border-t pt-2 mt-3 text-sm text-red-600">
                          <span>{t('payroll.slipDeductions')}</span>
                          <span>-{parseFloat(selectedSalaryDetails.deductions || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 border rounded-lg bg-primary/5 text-primary">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">{t('payroll.slipNet')}</span>
                          <span className="text-xl font-extrabold">{parseFloat(selectedSalaryDetails.net_salary || 0).toLocaleString()} AED</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs">
                          <span className="font-medium">{t('payroll.slipStatus')}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                            selectedSalaryDetails.status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {selectedSalaryDetails.status === 'paid' 
                              ? t('payroll.statusPaid') 
                              : t('payroll.statusProcessed')}
                          </span>
                        </div>
                        {selectedSalaryDetails.status === 'paid' && selectedSalaryDetails.payment_date && (
                          <div className="flex justify-between items-center mt-1 text-xs">
                            <span className="font-medium">{t('payroll.slipPaymentDate')}</span>
                            <span>{format(new Date(selectedSalaryDetails.payment_date), 'yyyy-MM-dd')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Info Section */}
                  {(selectedSalaryDetails.bank_name || selectedSalaryDetails.account_number || selectedSalaryDetails.iban) && (
                    <div className="bank-info border border-dashed rounded-lg p-4 bg-background">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">
                        {t('payroll.slipBankInfo')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {selectedSalaryDetails.bank_name && (
                          <div>
                            <div className="text-xs text-muted-foreground">{t('payroll.slipBankName')}</div>
                            <div className="font-semibold">{selectedSalaryDetails.bank_name}</div>
                          </div>
                        )}
                        {selectedSalaryDetails.account_number && (
                          <div>
                            <div className="text-xs text-muted-foreground">{t('payroll.slipAccount')}</div>
                            <div className="font-semibold">{selectedSalaryDetails.account_number}</div>
                          </div>
                        )}
                        {selectedSalaryDetails.iban && (
                          <div className="md:col-span-2">
                            <div className="text-xs text-muted-foreground">{t('payroll.slipIban')}</div>
                            <div className="font-semibold break-all">{selectedSalaryDetails.iban}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {selectedSalaryDetails.notes && (
                    <div className="border rounded-lg p-4 bg-gray-50/50 text-sm">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">
                        {t('common.notes')}
                      </h4>
                      <div className="whitespace-pre-wrap text-muted-foreground">{selectedSalaryDetails.notes}</div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
