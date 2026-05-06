const fs = require('fs');

const arPath = './messages/ar.json';
const enPath = './messages/en.json';

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const payrollEn = {
  "title": "Payroll",
  "processBatch": "Process Batch",
  "totalEmployees": "Total Employees",
  "pendingPayments": "Pending Payments",
  "paidThisMonth": "Paid This Month",
  "history": "Payroll History",
  "statusProcessed": "Processed",
  "statusPaid": "Paid",
  "period": "Period",
  "baseSalary": "Base Salary",
  "allowances": "Allowances",
  "deductions": "Deductions",
  "netSalary": "Net Salary",
  "payNow": "Pay Now",
  "viewSlip": "View Slip",
  "processFor": "Process Payroll For",
  "incentives": "Incentives",
  "bonuses": "Bonuses",
  "overtime": "Overtime",
  "confirmProcess": "Confirm Process",
  "salaryPaid": "Salary Paid Successfully",
  "errorPayingSalary": "Error Paying Salary",
  "payrollProcessed": "Processed {count} employees successfully",
  "errorProcessingPayroll": "Error processing payroll"
};

const payrollAr = {
  "title": "الرواتب",
  "processBatch": "معالجة الدفعة",
  "totalEmployees": "إجمالي الموظفين",
  "pendingPayments": "المدفوعات المعلقة",
  "paidThisMonth": "تم الدفع هذا الشهر",
  "history": "سجل الرواتب",
  "statusProcessed": "تمت المعالجة",
  "statusPaid": "تم الدفع",
  "period": "الفترة",
  "baseSalary": "الراتب الأساسي",
  "allowances": "البدلات",
  "deductions": "الاستقطاعات",
  "netSalary": "صافي الراتب",
  "payNow": "ادفع الآن",
  "viewSlip": "عرض القسيمة",
  "processFor": "معالجة رواتب شهر",
  "incentives": "الحوافز",
  "bonuses": "المكافآت",
  "overtime": "العمل الإضافي",
  "confirmProcess": "تأكيد المعالجة",
  "salaryPaid": "تم دفع الراتب بنجاح",
  "errorPayingSalary": "حدث خطأ أثناء دفع الراتب",
  "payrollProcessed": "تمت معالجة {count} موظفاً بنجاح",
  "errorProcessingPayroll": "حدث خطأ أثناء معالجة الرواتب"
};

if (!enData.payroll) {
  enData.payroll = payrollEn;
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  console.log('Added payroll to en.json');
} else {
  enData.payroll = { ...enData.payroll, ...payrollEn };
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  console.log('Updated payroll in en.json');
}

if (!arData.payroll) {
  arData.payroll = payrollAr;
  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  console.log('Added payroll to ar.json');
} else {
  arData.payroll = { ...arData.payroll, ...payrollAr };
  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  console.log('Updated payroll in ar.json');
}
