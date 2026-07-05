"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Loader2, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { getEmployeeById } from "@/app/services/api/employees";

const SalaryTab = ({ employeeId }) => {
  const { data, error, isLoading } = useSWR(
    employeeId ? `/employees/${employeeId}` : null,
    () => getEmployeeById(employeeId),
    {
      revalidateOnFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>حدث خطأ أثناء تحميل البيانات</p>
      </div>
    );
  }

  const employee = data?.data;

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">لا توجد بيانات</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "غير محدد";
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b last:border-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || "غير محدد"}</span>
    </div>
  );

  const totalSalary = 
    (parseFloat(employee.basic_salary) || 0) +
    (parseFloat(employee.housing_allowance) || 0) +
    (parseFloat(employee.transportation_allowance) || 0) +
    (parseFloat(employee.another_allowance) || 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5" />
            معلومات الراتب
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow label="الراتب الأساسي" value={formatCurrency(employee.basic_salary)} />
          <InfoRow label="بدل السكن" value={formatCurrency(employee.housing_allowance)} />
          <InfoRow label="بدل المواصلات" value={formatCurrency(employee.transportation_allowance)} />
          <InfoRow label="بدل آخر" value={formatCurrency(employee.another_allowance)} />
          <div className="flex justify-between py-3 font-bold text-lg">
            <span>إجمالي الراتب</span>
            <span className="text-primary">{formatCurrency(totalSalary)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5" />
            نوع الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow label="طريقة الدفع" value={employee.pay_type} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryTab;
