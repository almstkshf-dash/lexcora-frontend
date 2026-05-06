import { User, Eye, Shield, List, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PermissionsDialog from './PermissionsDialog';
import EditEmployeeDialog from './edit/EditEmployeeDialog';
import ActivityLogModal from './ActivityLogModal';
import { useTranslations } from '@/hooks/useTranslations';
import { deleteEmployee } from '@/app/services/api/employees';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function EmployeeTableRow({ employee, StatusBadge, isArabic, onEmployeeUpdate }) {
  const { t } = useTranslations();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteEmployee = async () => {
    const confirmMessage = isArabic 
      ? `هل أنت متأكد من حذف الموظف "${employee.name}"؟ سيتم حذف جميع الوثائق المرتبطة به.`
      : `Are you sure you want to delete employee "${employee.name}"? All related documents will be deleted.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await deleteEmployee(employee.id);
      
      if (response.success) {
        toast.success(isArabic ? 'تم حذف الموظف بنجاح' : 'Employee deleted successfully');
        // Refresh the employee list
        if (onEmployeeUpdate) {
          onEmployeeUpdate();
        }
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ أثناء حذف الموظف' : 'Error deleting employee'));
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء حذف الموظف' : 'Error deleting employee');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <tr className="hover:bg-muted/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="w-6 h-6 text-muted-foreground" />
          <div className="mr-4">
            <div className="text-sm font-medium text-foreground">{employee.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
        {isArabic ? employee.role_ar : employee.role_en}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
        {isArabic ? employee.department_ar : employee.department_en}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={employee.status} />
      </td>
      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
        {employee.lastLogin || '-'}
      </td> */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 items-center">
        <button 
          onClick={() => router.push(`./employees/${employee?.id}`)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title={t('employees.viewDetails')}
        >
          <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
        {/* <EditEmployeeDialog
          employeeId={employee?.id}
          onSuccess={onEmployeeUpdate}
          trigger={
            <button 
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title={t('employees.editEmployee')}
            >
              <Edit className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          }
        /> */}
        {/* <PermissionsDialog
          id={employee.id}
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded text-right cursor-pointer border-none bg-transparent"
              title={t('employees.permissions')}
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              {t('employees.permissions')}
            </button>
          }
        /> */}
        <ActivityLogModal
          employee={employee}
          trigger={
            <div 
              className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded text-right cursor-pointer"
              title={t('employees.activityLog')}
            >
              <List className="w-4 h-4 text-muted-foreground" />
              <span>{t('employees.activityLog')}</span>
            </div>
          }
        />
        <button 
          onClick={handleDeleteEmployee}
          disabled={isDeleting}
          className="p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('employees.deleteEmployee') || (isArabic ? 'حذف الموظف' : 'Delete Employee')}
        >
          <Trash2 className={`w-5 h-5 ${isDeleting ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`} />
        </button>
      </td>
      
    </tr>
  );
}