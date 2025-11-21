import { 
  LayoutDashboard, 
  Users, 
  UserRoundPlus,
  Package,
  Scale,
  Calendar,
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

const normalizePermission = (perm) => {
  if (!perm) return null;
  if (typeof perm === 'string') return perm.trim().toLowerCase();
  if (typeof perm === 'number') return perm.toString();

  const candidates = [
    perm.permission_key,
    perm.permission_name,
    perm.permission_en,
    perm.permission_ar,
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

export const getMenuItems = (t, userRole = null, userDepartment = null, permissions = []) => {
  const permissionSet = buildPermissionSet(permissions);

  const menuItems = [
    {
      id: '/',
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
      type: 'link'
    },
    {
      id: 'casesManagement',
      label: t('navigation.casesManagement'),
      icon: Scale,
      type: 'category',
      submenu: [
        { id: 'cases', label: t('navigation.cases'), icon: Scale },
        { id: 'cases/add-case', label: t('navigation.addCaseFile'), icon: FolderPlus },
        { id: 'cases/sessions', label: t('navigation.sessions'), icon: Calendar },
        { id: 'cases/judicial-decisions', label: t('navigation.judicialDecisions'), icon: CheckCircle },
      ]
    },
    {
      id: 'clientsManagement',
      label: t('navigation.clientsManagement'),
      icon: Users,
      type: 'category',
      submenu: [
        { id: 'parties', label: t('navigation.parties'), icon: Users },
        { id: 'potential-clients', label: t('navigation.potentialClients'), icon: UserRoundPlus },
        { id: 'meetings', label: t('navigation.meetings'), icon: Calendar },
        { id: 'call-logs', label: t('navigation.callLogs'), icon: Phone },
        { id: 'goaml', label: t('navigation.goaml'), icon: Shield },
        { id: 'client-forms', label: t('navigation.forms'), icon: FileText },
      ]
    },
    {
      id: 'approvals',
      label: t('navigation.approvalsCenter'),
      icon: CheckCircle,
      type: 'link'
    },
    {
      id: 'humanResources',
      label: t('navigation.humanResources'),
      icon: Users,
      type: 'category',
      submenu: [
        { id: 'hr/employees', label: t('navigation.employees'), icon: Users },
        { id: 'hr/requests', label: t('navigation.requests'), icon: FileText },
        { id: 'hr/assets', label: t('navigation.assets'), icon: Package },
        { id: 'hr/forms', label: t('navigation.forms'), icon: ScrollText },
        { id: 'hr/events', label: t('navigation.events'), icon: Calendar },
        { id: 'hr/notifications', label: t('navigation.notifications'), icon: Bell },
      ]
    },
    {
      id: 'finance',
      label: t('navigation.finance'),
      icon: DollarSign,
      type: 'category',
      submenu: [
        { id: 'finance/clients', label: t('navigation.financeClients'), icon: Users },
        { id: 'finance/invoices', label: t('navigation.invoices'), icon: List },
        { id: 'finance/bank-accounts', label: t('navigation.bankAccounts'), icon: Banknote },
        { id: 'finance/statistics', label: t('navigation.statistics'), icon: BarChartIcon },
        { id: 'finance/employees', label: t('navigation.employeesStatements'), icon: Users2     },
      ]
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: Settings2,
      type: 'category',
      submenu: [
        { id: 'settings/appearance', label: t('navigation.appearance'), icon: Palette },
        { id: 'settings/branches', label: t('navigation.branches'), icon: Building2 },
        // { id: 'settings/performance', label: t('navigation.performance'), icon: Gauge },
        { id: 'logs', label: t('navigation.logs'), icon: Clock },
      ]
    }
  ];

  return filterByPermissions(menuItems, permissionSet);
};
