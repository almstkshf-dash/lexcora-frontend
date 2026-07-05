export const PERMISSION_REQUIREMENTS = {
  dashboard: [],
  cases: ['cases:view', 'cases', 'view cases', 'cases_list', 'view case', 'show cases'],
  addCase: ['cases:create', 'add case', 'create case', 'cases_add'],
  sessions: ['sessions:view', 'sessions', 'view sessions', 'sessions_list', 'view session'],
  judicialDecisions: ['judicial-decisions:view', 'judicial decisions', 'judgments', 'view session'],
  parties: ['parties:view', 'clients', 'parties', 'parties_list', 'view party'],
  potentialClients: ['potential-clients:view', 'potential clients', 'leads', 'view party'],
  meetings: ['meetings:view', 'meetings', 'appointments', 'view meeting'],
  callLogs: ['call-logs:view', 'call logs', 'calls', 'view party', 'view session'],
  goaml: ['goaml:view', 'goaml', 'view party', 'view case'],
  clientForms: ['client-forms:view', 'client forms', 'forms', 'view party', 'view case'],
  approvals: ['approvals:view', 'approvals center', 'approvals_list', 'view employee request', 'view memo', 'view party order', 'view parties orders'],
  hrEmployees: ['hr:employees:view', 'employees', 'hr', 'human resources', 'view employee'],
  hrRequests: ['hr:requests:view', 'hr requests', 'employees requests', 'hr', 'view employee request'],
  hrAssets: ['hr:assets:view', 'assets', 'hr', 'view employee request'],
  hrForms: ['hr:forms:view', 'hr forms', 'forms', 'hr', 'view employee request'],
  hrEvents: ['hr:events:view', 'hr events', 'hr', 'view employee request'],
  hrNotifications: ['hr:notifications:view', 'hr notifications', 'hr', 'view hr notifications'],
  payroll: ['payroll:view', 'process payroll', 'pay salary', 'hr', 'human resources', 'edit paid leave value', 'edit unpaid leave value', 'view payroll'],
  financeClients: ['finance:clients:view', 'finance clients', 'finance', 'view employee cash transactions'],
  invoices: ['finance:invoices:view', 'invoices', 'finance', 'view_invoices', 'view employee cash transactions'],
  bankAccounts: ['finance:bank-accounts:view', 'bank accounts', 'finance', 'view_bank_accounts', 'view employee cash transactions'],
  financeLedger: ['finance:ledger:view', 'ledger', 'finance', 'view_accounts', 'view_journal_entries', 'view employee cash transactions'],
  pettyCash: ['finance:petty-cash:view', 'petty cash', 'finance', 'view_petty_cash', 'view employee cash transactions'],
  cashFlow: ['finance:cash-flow:view', 'cash flow', 'finance', 'view_financial_reports', 'view employee cash transactions'],
  financeStatistics: ['finance:statistics:view', 'finance statistics', 'finance', 'view_financial_reports', 'view_vat_reports', 'view employee cash transactions'],
  financeEmployees: ['finance:employees:view', 'employee statements', 'payroll', 'finance', 'view_employee_statements', 'view employee cash transactions'],
  settingsAppearance: ['settings:appearance:view', 'appearance', 'settings', 'view case', 'view party'],
  settingsBranches: ['settings:branches:view', 'branches', 'settings', 'view_branches', 'Add Branch'],
  logs: ['logs:view', 'activity logs', 'settings', 'view_logs'],
  security: ['manage_security', 'view_roles', 'view_permissions', 'settings'],
  settingsGeneral: ['settings:general:view', 'general settings', 'manage_settings', 'settings'],
};

export const ROUTE_PERMISSIONS = {
  '/': PERMISSION_REQUIREMENTS.dashboard,
  '/cases': PERMISSION_REQUIREMENTS.cases,
  '/cases/add-case': PERMISSION_REQUIREMENTS.addCase,
  '/cases/sessions': PERMISSION_REQUIREMENTS.sessions,
  '/cases/judicial-decisions': PERMISSION_REQUIREMENTS.judicialDecisions,
  '/parties': PERMISSION_REQUIREMENTS.parties,
  '/potential-clients': PERMISSION_REQUIREMENTS.potentialClients,
  '/meetings': PERMISSION_REQUIREMENTS.meetings,
  '/call-logs': PERMISSION_REQUIREMENTS.callLogs,
  '/goaml': PERMISSION_REQUIREMENTS.goaml,
  '/client-forms': PERMISSION_REQUIREMENTS.clientForms,
  '/approvals': PERMISSION_REQUIREMENTS.approvals,
  '/approvals/employee-transactions': PERMISSION_REQUIREMENTS.approvals,
  '/approvals/employees-requests': PERMISSION_REQUIREMENTS.approvals,
  '/approvals/invoices': PERMISSION_REQUIREMENTS.approvals,
  '/approvals/memos': PERMISSION_REQUIREMENTS.approvals,
  '/hr/employees': PERMISSION_REQUIREMENTS.hrEmployees,
  '/hr/requests': PERMISSION_REQUIREMENTS.hrRequests,
  '/hr/assets': PERMISSION_REQUIREMENTS.hrAssets,
  '/hr/forms': PERMISSION_REQUIREMENTS.hrForms,
  '/hr/events': PERMISSION_REQUIREMENTS.hrEvents,
  '/hr/notifications': PERMISSION_REQUIREMENTS.hrNotifications,
  '/hr/payroll': PERMISSION_REQUIREMENTS.payroll,
  '/finance/clients': PERMISSION_REQUIREMENTS.financeClients,
  '/finance/invoices': PERMISSION_REQUIREMENTS.invoices,
  '/finance/bank-accounts': PERMISSION_REQUIREMENTS.bankAccounts,
  '/finance/ledger': PERMISSION_REQUIREMENTS.financeLedger,
  '/finance/petty-cash': PERMISSION_REQUIREMENTS.pettyCash,
  '/finance/cash-flow': PERMISSION_REQUIREMENTS.cashFlow,
  '/finance/statistics': PERMISSION_REQUIREMENTS.financeStatistics,
  '/finance/employees': PERMISSION_REQUIREMENTS.financeEmployees,
  '/settings/appearance': PERMISSION_REQUIREMENTS.settingsAppearance,
  '/settings/branches': PERMISSION_REQUIREMENTS.settingsBranches,
  '/settings/general': PERMISSION_REQUIREMENTS.settingsGeneral,
  '/logs': PERMISSION_REQUIREMENTS.logs,
};

export const PUBLIC_PATHS = ['/login'];

export const getRequiredPermissionsForPath = (pathname) => {
  if (!pathname) return null;

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const entries = Object.entries(ROUTE_PERMISSIONS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [route, required] of entries) {
    if (route === '/' && normalizedPath === '/') {
      return required;
    }

    if (normalizedPath === route || normalizedPath.startsWith(`${route}/`)) {
      return required;
    }
  }

  return null;
};
