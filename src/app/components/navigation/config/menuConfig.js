import { 
  LayoutDashboard, 
  Users, 
  UserRoundPlus,
  Package,
  Scale,
  Calendar,
  CalendarClock,
  CalendarCheck2,
  CalendarDays,
  FolderPlus,
  CheckCircle,
  FileText,
  ScrollText,
  Bell,
  Settings2,
  Palette,
  Shield,
  Phone,
  DollarSign,
  Banknote,
  Clock,
  List,
  BarChartIcon,
  Users2,
  Building2,
  Gauge
} from 'lucide-react';
import { PERMISSION_REQUIREMENTS } from '@/lib/permissions';

const normalizePermission = (perm) => {
  if (!perm) return null;
  if (typeof perm === 'string') return perm.trim().toLowerCase();
  if (typeof perm === 'number') return perm.toString();

  const candidates = [
    perm.permission_key,
    perm.permission_name,
    perm.permission_en,
    perm.permission_ar,
    perm.permission_group_name,
    perm.permission_parent_name,
    perm.name,
    perm.code,
    perm.id,
    perm.permission_id
  ].filter(Boolean);

  if (candidates.length === 0) return null;
  return candidates[0].toString().trim().toLowerCase();
};

const buildPermissionSet = (permissions = []) => {
  const set = new Set();
  permissions.forEach((perm) => {
    const normalized = normalizePermission(perm);
    if (normalized) set.add(normalized);
  });
  return set;
};

const filterByPermissions = (items = [], permissionSet) => {
  if (!permissionSet || permissionSet.size === 0) {
    return items;
  }

  return items
    .map((item) => {
      const required = item.requiredPermissions;
      const requires = Array.isArray(required) ? required : required ? [required] : [];
      const allowed =
        requires.length === 0 ||
        requires.some((perm) => {
          const normalized = normalizePermission(perm);
          return normalized ? permissionSet.has(normalized) : false;
        });

      if (!allowed) return null;

      // Recursively filter submenus
      const filteredSubmenu = item.submenu
        ? filterByPermissions(item.submenu, permissionSet)
        : undefined;

      return {
        ...item,
        ...(filteredSubmenu ? { submenu: filteredSubmenu } : {}),
      };
    })
    .filter((item) => {
      if (!item) return false;
      // Drop empty categories
      if (item.submenu && item.submenu.length === 0) return false;
      return true;
    });
};

export const getMenuItems = (t, userRole = null, userDepartment = null, permissions = [], options = {}) => {
  const { allowAll = false } = options;
  const permissionSet = buildPermissionSet(permissions);

  const menuItems = [
    {
      id: '/',
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
      type: 'link',
      requiredPermissions: PERMISSION_REQUIREMENTS.dashboard
    },
    {
      id: 'casesManagement',
      label: t('navigation.casesManagement'),
      icon: Scale,
      type: 'category',
      submenu: [
        { id: 'cases', label: t('navigation.cases'), icon: Scale, requiredPermissions: PERMISSION_REQUIREMENTS.cases },
        { id: 'cases/add-case', label: t('navigation.addCaseFile'), icon: FolderPlus, requiredPermissions: PERMISSION_REQUIREMENTS.addCase },
        { id: 'cases/sessions', label: t('navigation.sessions'), icon: CalendarClock, requiredPermissions: PERMISSION_REQUIREMENTS.sessions },
        { id: 'cases/judicial-decisions', label: t('navigation.judicialDecisions'), icon: CheckCircle, requiredPermissions: PERMISSION_REQUIREMENTS.judicialDecisions },
      ]
    },
    {
      id: 'clientsManagement',
      label: t('navigation.clientsManagement'),
      icon: Users,
      type: 'category',
      submenu: [
        { id: 'parties', label: t('navigation.parties'), icon: Users, requiredPermissions: PERMISSION_REQUIREMENTS.parties },
        { id: 'potential-clients', label: t('navigation.potentialClients'), icon: UserRoundPlus, requiredPermissions: PERMISSION_REQUIREMENTS.potentialClients },
        { id: 'meetings', label: t('navigation.meetings'), icon: CalendarCheck2, requiredPermissions: PERMISSION_REQUIREMENTS.meetings },
        { id: 'call-logs', label: t('navigation.callLogs'), icon: Phone, requiredPermissions: PERMISSION_REQUIREMENTS.callLogs },
        { id: 'goaml', label: t('navigation.goaml'), icon: Shield, requiredPermissions: PERMISSION_REQUIREMENTS.goaml },
        { id: 'client-forms', label: t('navigation.forms'), icon: FileText, requiredPermissions: PERMISSION_REQUIREMENTS.clientForms },
      ]
    },
    {
      id: 'approvals',
      label: t('navigation.approvalsCenter'),
      icon: CheckCircle,
      type: 'link',
      requiredPermissions: PERMISSION_REQUIREMENTS.approvals
    },
    {
      id: 'humanResources',
      label: t('navigation.humanResources'),
      icon: Users,
      type: 'category',
      submenu: [
        { id: 'hr/employees', label: t('navigation.employees'), icon: Users, requiredPermissions: PERMISSION_REQUIREMENTS.hrEmployees },
        { id: 'hr/requests', label: t('navigation.requests'), icon: FileText, requiredPermissions: PERMISSION_REQUIREMENTS.hrRequests },
        { id: 'hr/assets', label: t('navigation.assets'), icon: Package, requiredPermissions: PERMISSION_REQUIREMENTS.hrAssets },
        { id: 'hr/forms', label: t('navigation.forms'), icon: ScrollText, requiredPermissions: PERMISSION_REQUIREMENTS.hrForms },
        { id: 'hr/events', label: t('navigation.events'), icon: CalendarDays, requiredPermissions: PERMISSION_REQUIREMENTS.hrEvents },
        { id: 'hr/notifications', label: t('navigation.notifications'), icon: Bell, requiredPermissions: PERMISSION_REQUIREMENTS.hrNotifications },
      ]
    },
    {
      id: 'finance',
      label: t('navigation.finance'),
      icon: DollarSign,
      type: 'category',
      submenu: [
        { id: 'finance/clients', label: t('navigation.financeClients'), icon: Users, requiredPermissions: PERMISSION_REQUIREMENTS.financeClients },
        { id: 'finance/invoices', label: t('navigation.invoices'), icon: List, requiredPermissions: PERMISSION_REQUIREMENTS.invoices },
        { id: 'finance/bank-accounts', label: t('navigation.bankAccounts'), icon: Banknote, requiredPermissions: PERMISSION_REQUIREMENTS.bankAccounts },
        { id: 'finance/petty-cash', label: t('navigation.pettyCash'), icon: Banknote, requiredPermissions: PERMISSION_REQUIREMENTS.pettyCash },
        { id: 'finance/cash-flow', label: t('navigation.cashFlow'), icon: BarChartIcon, requiredPermissions: PERMISSION_REQUIREMENTS.cashFlow },
        { id: 'finance/statistics', label: t('navigation.statistics'), icon: BarChartIcon, requiredPermissions: PERMISSION_REQUIREMENTS.financeStatistics },
        { id: 'finance/employees', label: t('navigation.employeesStatements'), icon: Users2, requiredPermissions: PERMISSION_REQUIREMENTS.financeEmployees     },
      ]
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: Settings2,
      type: 'category',
      submenu: [
        { id: 'settings/appearance', label: t('navigation.appearance'), icon: Palette, requiredPermissions: PERMISSION_REQUIREMENTS.settingsAppearance },
        { id: 'settings/branches', label: t('navigation.branches'), icon: Building2, requiredPermissions: PERMISSION_REQUIREMENTS.settingsBranches },
        { id: 'settings/user-guide', label: t('navigation.userGuide'), icon: FileText },
        // { id: 'settings/performance', label: t('navigation.performance'), icon: Gauge },
        { id: 'logs', label: t('navigation.logs'), icon: Clock, requiredPermissions: PERMISSION_REQUIREMENTS.logs },
      ]
    }
  ];

  if (allowAll) {
    return menuItems;
  }

  return filterByPermissions(menuItems, permissionSet);
};
