"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  getSalaries, 
  processPayroll, 
  paySalary 
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
  const employees = employeesData?.data || [];
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPeriod, setProcessingPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [batchData, setBatchData] = useState([]);

  const handlePaySalary = async (salaryId) => {
    try {
      await paySalary(salaryId, { paymentDate: new Date() });
      toast.success(t('payroll.salaryPaid'));
      mutateSalaries();
    } catch (error) {
      toast.error(t('payroll.errorPayingSalary'));
    }
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
              <Clock className="w-4 h-4 text-orange-500" />
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
                          <Button size="sm" variant="outline">
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
    </div>
  );
}
