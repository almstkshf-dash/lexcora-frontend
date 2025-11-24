'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Calendar, CheckCircle2, Cpu, FileText, Folder, Search, Shield, Sparkles, Users } from 'lucide-react';

const sectionsEn = [
  {
    icon: Search,
    title: 'Navigation & Workflows',
    items: [
      {
        action: 'Path: Sidebar > Cases / HR / Finance / Approvals / Settings / Logs. Pin "My Tasks", "Approvals", and "Sessions" to Favorites.',
        benefit: 'Gives every role a predictable daily start and reduces navigation time.',
      },
      {
        action: 'Use Global Search (header) with filters (branch, status, date, entity) then jump into the record. Save frequent filter sets where available.',
        benefit: 'Cuts search noise and gets you directly to the right case, party, or document.',
      },
      {
        action: 'Switch language/theme in Settings > Appearance; confirm RTL/LTR is correct for your branch.',
        benefit: 'Prevents layout issues and keeps mixed-language teams productive.',
      },
      {
        action: 'Open Logs (Settings > Logs) when you need to see who changed what and when.',
        benefit: 'Speeds investigations and supports audit/compliance work.',
      },
    ],
  },
  {
    icon: Folder,
    title: 'Case Management',
    items: [
      {
        action: 'Intake: Cases > New > fill court/branch/type, parties, and representatives. Add related cases if any.',
        benefit: 'Accurate metadata powers reporting, conflict checks, and AI grounding.',
      },
      {
        action: 'Documents: Attach filings, evidence, and correspondence to the case or specific sessions.',
        benefit: 'Keeps provenance clear and lets the assistant cite sources automatically.',
      },
      {
        action: 'Tasks: Create tasks tied to legal periods; set owner, due date, and reminder. Link to the relevant case/session.',
        benefit: 'Prevents missed statutory deadlines and clarifies accountability.',
      },
      {
        action: 'Appeals/challenges and linked cases: add when escalation or parallel files exist.',
        benefit: 'Gives the team a connected litigation map with no blind spots.',
      },
      {
        action: 'Party tabs (info/files/meetings/orders/deals): keep each tab synchronized after every interaction.',
        benefit: 'Preserves a single source of truth for case stakeholders.',
      },
    ],
  },
  {
    icon: Calendar,
    title: 'Sessions & Judicial Timings',
    items: [
      {
        action: 'Setup: Settings > Judicial Timings. Define legal periods, cutoff rules, and reminder offsets before creating sessions.',
        benefit: 'Aligns every session and task deadline with jurisdictional requirements.',
      },
      {
        action: 'Create session: add date, courtroom, decision/ruling status, and mark reserved judgments when applicable.',
        benefit: 'Builds a defensible session history that can be printed or exported.',
      },
      {
        action: 'Link rulings and tasks to a legal timing template; let the system compute due dates.',
        benefit: 'Eliminates manual date math and reduces missed statutory windows.',
      },
      {
        action: 'Clear "sessions without decisions" and review weekly timing alerts.',
        benefit: 'Keeps the docket current and avoids hidden backlog.',
      },
      {
        action: 'Use calendar widgets and reminders for upcoming hearings and legal periods.',
        benefit: 'Keeps litigators, case managers, and assistants synchronized.',
      },
    ],
  },
  {
    icon: Bell,
    title: 'Approvals Center',
    items: [
      {
        action: 'Submit approvals from the source record (memos, invoices, HR, finance actions) or directly via Approvals > New Request; attach supporting files.',
        benefit: 'Centralizes review so nothing is lost in email threads.',
      },
      {
        action: 'Assign approvers, add watchers, and set due dates aligned to legal/finance periods; add stages if multi-step sign-off is required.',
        benefit: 'Clarifies ownership, sequencing, and expected turnaround.',
      },
      {
        action: 'Triaging: filter by branch/status/type/assignee; batch-approve where policy allows; return with comments when fixes are needed.',
        benefit: 'Cuts daily review time and keeps work moving without bottlenecks.',
      },
      {
        action: 'Track timeline, comments, and attachments; resubmit with a new version instead of duplicating requests.',
        benefit: 'Maintains a clean audit trail and reduces duplicate work.',
      },
      {
        action: 'Enable browser notifications and email alerts for requesters and assignees.',
        benefit: 'Shortens cycle time and improves SLA adherence.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'Documents, Forms & Attachments',
    items: [
      {
        action: 'Forms: Settings > Forms (or module Form tab) > choose template, name it, set visibility/branch, and publish.',
        benefit: 'Standardizes intake and ensures consistent data capture.',
      },
      {
        action: 'Allowed form files: PDF, DOCX, XLSX, JPG, PNG. Keep names descriptive (e.g., "ClientIntake_2025-11-22.pdf").',
        benefit: 'Makes documents easy to open, search, and trace.',
      },
      {
        action: 'Attachments: PDF, DOCX, XLSX, CSV, JPG, PNG, MP4 are supported; typical per-file limit 25–50 MB (admin-defined). Avoid password-protected archives.',
        benefit: 'Reduces upload errors and ensures downstream processing works.',
      },
      {
        action: 'Link each attachment to the relevant case/session/task/approval and add a short description.',
        benefit: 'Improves context for reviewers and for AI citations.',
      },
      {
        action: 'Use exports (CSV/PDF/prints) on tables and finance records as needed.',
        benefit: 'Delivers shareable outputs without manual formatting.',
      },
    ],
  },
  {
    icon: Users,
    title: 'Client Management',
    items: [
      {
        action: 'Leads: Add potential clients with source, owner, and next action; log every call/email before conversion.',
        benefit: 'Improves conversion and prevents duplicate outreach.',
      },
      {
        action: 'Conversion: When ready, convert a lead to client and optionally open a case with the same context.',
        benefit: 'Preserves pre-sales history and speeds onboarding.',
      },
      {
        action: 'Appointments/meetings: schedule from the client record; attach agenda, minutes, and decisions; add attendees.',
        benefit: 'Creates a verifiable trail of commitments and decisions.',
      },
      {
        action: 'Call logs: record outcome, follow-up date, and responsible staff; add tags (e.g., billing, evidence, negotiation).',
        benefit: 'Keeps follow-ups visible and reduces missed callbacks.',
      },
      {
        action: 'Link clients to active cases, invoices, and approvals.',
        benefit: 'Gives finance and legal teams a shared view of the relationship.',
      },
    ],
  },
  {
    icon: Users,
    title: 'HR: People, Assets & Events',
    items: [
      {
        action: 'People: maintain profiles, roles, attendance, leave, deductions, trainings, warnings, and performance reviews.',
        benefit: 'Provides a single HR ledger for compliance and payroll alignment.',
      },
      {
        action: 'Assets: assign assets with condition, serial, and return dates; record license numbers and expirations.',
        benefit: 'Prevents loss, enforces accountability, and keeps renewals timely.',
      },
      {
        action: 'Documents/records: store contracts, IDs, certifications with expiry alerts; set reminder windows (e.g., 30/60 days).',
        benefit: 'Avoids compliance lapses and last-minute renewals.',
      },
      {
        action: 'Events & alerts: create trainings, reviews, and disciplinary events; notify managers and employees; log outcomes.',
        benefit: 'Keeps stakeholders aligned on obligations and follow-ups.',
      },
      {
        action: 'Finance tie-in: sync HR data with payroll, expenses, and bank logs when issuing payments.',
        benefit: 'Reduces discrepancies between HR records and finance payouts.',
      },
    ],
  },
  {
    icon: Cpu,
    title: 'AI Assistant',
    items: [
      {
        action: 'Open from header or floating button; inside a case it auto-loads parties, sessions, tasks, and documents.',
        benefit: 'Starts every query with grounded context.',
      },
      {
        action: 'Ask scoped questions: include case number, date range, or branch; use "search: ..." for document-grounded answers.',
        benefit: 'Improves precision and reduces irrelevant results.',
      },
      {
        action: 'Attach files when needed; the assistant cites sources and page numbers where possible.',
        benefit: 'Keeps outputs verifiable for legal or audit needs.',
      },
      {
        action: 'Request structured outputs (tables, bullet summaries, checklists).',
        benefit: 'Produces ready-to-share artifacts with minimal editing.',
      },
      {
        action: 'For status queries, ask by task/session/approval (e.g., "approvals due this week for branch A").',
        benefit: 'Surfaces operational risks quickly.',
      },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications & Best Practices',
    items: [
      {
        action: 'Enable browser and email notifications for approvals, assignments, and timing alerts.',
        benefit: 'Keeps you responsive to time-sensitive work.',
      },
      {
        action: 'Review daily: My Tasks, Approvals, Sessions without decisions, expiring documents/licenses.',
        benefit: 'Catches operational and compliance risks early.',
      },
      {
        action: 'Archive instead of deleting when policy allows; keep naming and tagging consistent.',
        benefit: 'Preserves history and improves search and AI grounding.',
      },
      {
        action: 'Use Logs to verify actions before escalating issues.',
        benefit: 'Reduces back-and-forth and speeds remediation.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Access, Security & Settings',
    items: [
      {
        action: 'Request missing permissions from admin if a page/action is blocked; review branch scoping.',
        benefit: 'Applies least-privilege while keeping you unblocked.',
      },
      {
        action: 'Upload only approved content; avoid sensitive data in chat unless policy allows.',
        benefit: 'Reduces leakage risk and keeps records clean.',
      },
      {
        action: 'Log out on shared devices; rotate credentials per policy.',
        benefit: 'Prevents unauthorized access to cases and finance data.',
      },
      {
        action: 'Settings > Appearance: set language/theme; Settings > Branches: manage branch access; Settings > Logs: audit activity.',
        benefit: 'Keeps the workspace aligned with your team and audit needs.',
      },
    ],
  },
  {
    icon: CheckCircle2,
    title: 'Reporting & Exports',
    items: [
      {
        action: 'Dashboards/widgets: monitor sessions, tasks, approvals, finance, and HR KPIs by branch/date.',
        benefit: 'Gives leaders a live pulse without digging through tables.',
      },
      {
        action: 'Use exports/prints (CSV/PDF) on cases, finance, HR, and approvals for sharing outside the system.',
        benefit: 'Delivers consistent packets to clients, auditors, or regulators.',
      },
      {
        action: 'Reconcile bank logs and finance statements regularly; log variances.',
        benefit: 'Prevents month-end surprises and supports audits.',
      },
      {
        action: 'Review timing/expiry reports weekly (legal periods, approvals due, expiring IDs/licenses).',
        benefit: 'Reduces deadline risk across legal and HR domains.',
      },
    ],
  },
];

const sectionsAr = [
  {
    icon: Search,
    title: 'التنقل ومسار العمل',
    items: [
      {
        action: 'المسار: الشريط الجانبي > القضايا / الموارد البشرية / المالية / الموافقات / الإعدادات / السجلات. ثبّت "مهامي" و"الموافقات" و"الجلسات" في المفضلة.',
        benefit: 'يوفر نقطة انطلاق يومية واضحة ويقلل وقت التنقل لكل دور.',
      },
      {
        action: 'استخدم البحث العام في الترويسة مع المرشحات (الفرع، الحالة، التاريخ، الكيان) ثم انتقل مباشرة للسجل. احفظ المرشحات المتكررة حيثما أمكن.',
        benefit: 'يقلل الضوضاء ويوصلك مباشرة للقضية أو الطرف أو المستند الصحيح.',
      },
      {
        action: 'غيّر اللغة/المظهر في الإعدادات > المظهر؛ تحقق من صحة RTL/LTR حسب الفرع.',
        benefit: 'يمنع مشاكل التخطيط ويبقي الفرق متعددة اللغات منتجة.',
      },
      {
        action: 'افتح السجلات (الإعدادات > السجلات) عند الحاجة لمعرفة من غيّر ماذا ومتى.',
        benefit: 'يسرع التحقيقات ويدعم التدقيق والامتثال.',
      },
    ],
  },
  {
    icon: Folder,
    title: 'إدارة القضايا',
    items: [
      {
        action: 'الاستقبال: القضايا > جديد > أدخل المحكمة/الفرع/النوع، الأطراف، الممثلين. أضف القضايا المرتبطة إن وجدت.',
        benefit: 'البيانات الدقيقة تحسن التقارير، تضارب المصالح، وتغذية المساعد.',
      },
      {
        action: 'المستندات: أرفق المذكرات والأدلة والمراسلات للقضية أو للجلسات المحددة.',
        benefit: 'يبقي السجل واضح المصدر ويسمح للمساعد بالاستشهاد تلقائياً.',
      },
      {
        action: 'المهام: أنشئ مهام مرتبطة بالمدد النظامية؛ حدد المالك، تاريخ الاستحقاق، والتنبيه، واربطها بالقضية/الجلسة.',
        benefit: 'يمنع تفويت المدد النظامية ويوضح المسؤولية.',
      },
      {
        action: 'الاستئناف/الاعتراض والقضايا المرتبطة: أضفها عند وجود تصعيد أو ملفات موازية.',
        benefit: 'يبني خريطة تقاضي مترابطة بلا ثغرات.',
      },
      {
        action: 'علامات الأطراف (معلومات/ملفات/اجتماعات/أوامر/صفقات): حدّثها بعد كل تفاعل.',
        benefit: 'يحافظ على مصدر موحد للبيانات لجميع أصحاب المصلحة.',
      },
    ],
  },
  {
    icon: Calendar,
    title: 'الجلسات والتوقيتات القضائية',
    items: [
      {
        action: 'الإعداد: الإعدادات > التوقيتات القضائية. عرّف المدد النظامية وقواعد القطع ومواعيد التنبيه قبل إنشاء الجلسات.',
        benefit: 'يوائم كل جلسة ومهمة مع المتطلبات النظامية.',
      },
      {
        action: 'إنشاء جلسة: حدد التاريخ والمجلس وحالة القرار/الحكم، وأشر للأحكام المحجوزة عند الحاجة.',
        benefit: 'يبني تاريخ جلسات قابل للطباعة والتصدير.',
      },
      {
        action: 'اربط الأحكام والمهام بقالب توقيت قضائي لاحتساب المواعيد تلقائياً.',
        benefit: 'يلغي الحساب اليدوي ويقلل ضياع المدد.',
      },
      {
        action: 'نظف "جلسات بلا قرارات" وراجع تنبيهات التوقيت أسبوعياً.',
        benefit: 'يبقي الرُزنامة محدثة ويمنع التراكم الخفي.',
      },
      {
        action: 'استخدم الودجت والتنبيهات لمراقبة الجلسات والمهل القادمة.',
        benefit: 'يبقي المحامين ومديري القضايا مسايرين للمحكمة.',
      },
    ],
  },
  {
    icon: Bell,
    title: 'مركز الموافقات',
    items: [
      {
        action: 'قدّم طلبات الموافقة من السجل الأصلي (مذكرة، فاتورة، بند موارد بشرية، إجراء مالي) أو مباشرة من مركز الموافقات > طلب جديد مع المرفقات.',
        benefit: 'يجمع المراجعات في مكان واحد بدلاً من البريد.',
      },
      {
        action: 'عيّن المراجعين وأضف المتابعين وحدد تاريخ استحقاق مرتبطاً بالمدد النظامية/المالية؛ أضف مراحل إذا لزم توقيع متعدد.',
        benefit: 'يوضح الملكية والترتيب والزمن المتوقع.',
      },
      {
        action: 'فرز العمل: رشّح حسب الفرع/الحالة/النوع/المكلف؛ اعتمد جماعياً حيث تسمح السياسة؛ أعد مع التعليقات عند الحاجة للتصحيح.',
        benefit: 'يقلل وقت الفرز اليومي ويحافظ على تدفق العمل.',
      },
      {
        action: 'تابع الخط الزمني والتعليقات والمرفقات؛ أعد الإرسال كنسخة جديدة بدلاً من تكرار الطلب.',
        benefit: 'يحافظ على أثر تدقيق نظيف ويقلل العمل المكرر.',
      },
      {
        action: 'فعّل إشعارات المتصفح والبريد للطالب والمكلفين بالموافقة.',
        benefit: 'يقصر زمن الدورة ويحسّن الالتزام باتفاقيات الخدمة.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'المستندات والنماذج والمرفقات',
    items: [
      {
        action: 'النماذج: الإعدادات > النماذج (أو تبويب النماذج في الوحدة) > اختر القالب، سمّه، حدد الصلاحيات/الفرع، ثم انشر.',
        benefit: 'يوحد جمع البيانات ويضمن اتساقها.',
      },
      {
        action: 'ملفات النماذج المسموحة: PDF وDOCX وXLSX وJPG وPNG مع أسماء واضحة (مثال: ClientIntake_2025-11-22.pdf).',
        benefit: 'يسهل الفتح والبحث والتتبع.',
      },
      {
        action: 'المرفقات: يدعم PDF وDOCX وXLSX وCSV وJPG وPNG وMP4؛ الحد لكل ملف عادة 25–50 م.ب حسب سياسة المسؤول. تجنب الأرشيفات المحمية بكلمة مرور.',
        benefit: 'يقلل أخطاء الرفع ويضمن نجاح المعالجة.',
      },
      {
        action: 'اربط كل مرفق بالقضية/الجلسة/المهمة/الموافقة وأضف وصفاً قصيراً.',
        benefit: 'يحسن السياق للمراجعين وللاستشهادات الآلية.',
      },
      {
        action: 'استخدم التصدير (CSV/PDF/طباعة) للجداول وسجلات المالية عند الحاجة.',
        benefit: 'يقدم مخرجات جاهزة للمشاركة دون تنسيق يدوي.',
      },
    ],
  },
  {
    icon: Users,
    title: 'إدارة العملاء',
    items: [
      {
        action: 'العملاء المحتملون: أضف المصدر والمالك والإجراء التالي؛ سجّل كل مكالمة/بريد قبل التحويل.',
        benefit: 'يحسن التحويل ويمنع ازدواجية التواصل.',
      },
      {
        action: 'التحويل: عند الجاهزية، حوّل الفرصة إلى عميل وافتح قضية بنفس السياق.',
        benefit: 'يحفظ سجل ما قبل البيع ويسرّع الإعداد.',
      },
      {
        action: 'المواعيد/الاجتماعات: جدولها من سجل العميل؛ أرفق الأجندة والمحضر والقرارات وأضف الحضور.',
        benefit: 'يبني أثراً موثقاً للالتزامات والقرارات.',
      },
      {
        action: 'سجلات المكالمات: سجّل النتيجة وتاريخ المتابعة والمسؤول، وأضف وسوم مثل (فوترة/أدلة/تفاوض).',
        benefit: 'يحافظ على وضوح المتابعات ويقلل المكالمات الضائعة.',
      },
      {
        action: 'اربط العملاء بالقضايا والفواتير والموافقات النشطة.',
        benefit: 'يوفر رؤية مشتركة بين الفرق القانونية والمالية.',
      },
    ],
  },
  {
    icon: Users,
    title: 'الموارد البشرية: الأفراد والأصول والفعاليات',
    items: [
      {
        action: 'الأفراد: حافظ على الملفات الشخصية والأدوار والحضور والإجازات والخصومات والتدريبات والتنبيهات والتقييمات.',
        benefit: 'يوفر دفتر أستاذ موحد للامتثال ومواءمة الرواتب.',
      },
      {
        action: 'الأصول: سلّم الأصول مع الحالة والرقم المتسلسل وتاريخ الإرجاع؛ سجّل أرقام التراخيص وتواريخ الانتهاء.',
        benefit: 'يمنع فقد الأصول ويضمن تجديد التراخيص في موعدها.',
      },
      {
        action: 'الوثائق/السجلات: خزّن العقود والهويات والشهادات مع تنبيهات الانتهاء واضبط نوافذ التذكير (مثل 30/60 يوماً).',
        benefit: 'يتجنب المخاطر النظامية والتنبيهات المتأخرة.',
      },
      {
        action: 'الفعاليات والتنبيهات: أنشئ التدريبات والتقييمات والإجراءات التأديبية، وأبلغ المديرين والموظفين وسجّل النتائج.',
        benefit: 'يبقي أصحاب العلاقة متوافقين حول الالتزامات والمتابعات.',
      },
      {
        action: 'الربط المالي: اربط بيانات الموارد البشرية بالرواتب والمصاريف وسجلات البنك عند صرف الدفعات.',
        benefit: 'يقلل الفروقات بين سجلات الموارد البشرية والصرف المالي.',
      },
    ],
  },
  {
    icon: Cpu,
    title: 'المساعد الذكي',
    items: [
      {
        action: 'افتحه من الترويسة أو الزر العائم؛ داخل القضية يجلب الأطراف والجلسات والمهام والمستندات تلقائياً.',
        benefit: 'يبدأ كل سؤال بسياق موثوق.',
      },
      {
        action: 'استخدم أسئلة محددة: رقم القضية أو نطاق التاريخ أو الفرع، واستعمل "search: ..." للإجابات المعتمدة على المستندات.',
        benefit: 'يحسّن الدقة ويقلل النتائج غير المهمة.',
      },
      {
        action: 'أرفق الملفات عند الحاجة؛ المساعد يستشهد بالمصادر وأرقام الصفحات حيثما أمكن.',
        benefit: 'يبقي المخرجات قابلة للتحقق قانونياً أو تدقيقياً.',
      },
      {
        action: 'اطلب مخرجات منظمة (جداول، ملخصات نقطية، قوائم تحقق).',
        benefit: 'يقدم نتائج جاهزة للمشاركة بأقل تحرير.',
      },
      {
        action: 'للاستعلامات التشغيلية، اسأل حسب المهمة/الجلسة/الموافقة (مثال: "الموافقات المستحقة هذا الأسبوع لفرع الرياض").',
        benefit: 'يظهر المخاطر التشغيلية بسرعة.',
      },
    ],
  },
  {
    icon: Bell,
    title: 'الإشعارات وأفضل الممارسات',
    items: [
      {
        action: 'فعّل إشعارات المتصفح والبريد للموافقات والتكليفات وتنبيهات التوقيت.',
        benefit: 'يبقيك سريع الاستجابة للأعمال الحساسة زمنياً.',
      },
      {
        action: 'مراجعة يومية: مهامي، الموافقات، الجلسات بلا قرارات، الوثائق/التراخيص المنتهية.',
        benefit: 'يكتشف المخاطر التشغيلية والامتثالية مبكراً.',
      },
      {
        action: 'أرشف بدلاً من الحذف حيث تسمح السياسة، وحافظ على تسمية/وسم موحد.',
        benefit: 'يحفظ التاريخ ويحسن البحث وتغذية المساعد.',
      },
      {
        action: 'استخدم السجلات للتحقق من الأفعال قبل تصعيد المشاكل.',
        benefit: 'يقلل المراسلات ويُسرع الحل.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'الوصول والأمان والإعدادات',
    items: [
      {
        action: 'اطلب الصلاحيات الناقصة من المسؤول إذا مُنع إجراء/صفحة؛ تحقق من نطاقات الفروع.',
        benefit: 'يطبق مبدأ أقل صلاحية دون تعطيل العمل.',
      },
      {
        action: 'حمّل محتوى مسموحاً فقط؛ تجنب البيانات الحساسة في الدردشة إلا عند سماح السياسة.',
        benefit: 'يقلل مخاطر التسرب ويحافظ على نظافة السجلات.',
      },
      {
        action: 'سجّل الخروج في الأجهزة المشتركة ودوّر بيانات الدخول حسب السياسة.',
        benefit: 'يمنع وصولاً غير مصرح به للقضايا والبيانات المالية.',
      },
      {
        action: 'الإعدادات > المظهر: لغة/ثيم؛ الإعدادات > الفروع: إدارة الفروع؛ الإعدادات > السجلات: تدقيق النشاط.',
        benefit: 'يحافظ على بيئة عمل متوافقة مع فريقك ومتطلبات التدقيق.',
      },
    ],
  },
  {
    icon: CheckCircle2,
    title: 'التقارير والتصدير',
    items: [
      {
        action: 'اللوحات/الودجت: راقب الجلسات والمهام والموافقات ومؤشرات المالية والموارد البشرية حسب الفرع/التاريخ.',
        benefit: 'يعطي القادة نبضاً حياً دون الغوص في الجداول.',
      },
      {
        action: 'استخدم التصدير/الطباعة (CSV/PDF) في القضايا والمالية والموارد البشرية والموافقات للمشاركة خارج النظام.',
        benefit: 'يقدم حزم متسقة للعملاء أو المدققين أو الجهات الرقابية.',
      },
      {
        action: 'سوِّ سجلات البنك وكشوف المالية بانتظام وسجّل الفروقات.',
        benefit: 'يمنع مفاجآت نهاية الشهر ويدعم التدقيق.',
      },
      {
        action: 'راجع تقارير المدد/الانتهاء أسبوعياً (مدد قانونية، موافقات مستحقة، وثائق/تراخيص منتهية).',
        benefit: 'يقلل مخاطر المواعيد عبر القانوني والموارد البشرية.',
      },
    ],
  },
];

export default function UserGuidePage() {
  const { isRTL } = useLanguage();
  const isArabic = isRTL;
  const data = isArabic ? sectionsAr : sectionsEn;

  return (
    <div className="container mx-auto py-8 space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <Card className="p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <Badge className="w-fit flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            {isArabic ? 'دليل الاستخدام' : 'User Guide'}
          </Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">
              {isArabic ? 'استخدم كل ميزة بثقة' : 'Use Every Feature with Confidence'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? 'خطوات عملية مفصلة تربط كل وحدة بمسار العمل والفائدة المباشرة.'
                : 'Detailed, actionable steps that tie each module to your daily workflow.'}
            </p>
          </div>
          <Separator />
          <p className="text-muted-foreground text-sm">
            {isArabic
              ? 'افتح كل قسم لقراءة الخطوات والفوائد وكيفية تطبيقها في عملك اليومي.'
              : 'Expand each section for steps, benefits, and how to apply them in daily work.'}
          </p>
        </div>
      </Card>

      <Accordion
        type="multiple"
        className="divide-y rounded-xl border shadow-sm">
        {data.map((section, idx) => {
          const Icon = section.icon || CheckCircle2;
          return (
            <AccordionItem key={section.title} value={`${section.title}-${idx}`}>
              <AccordionTrigger className="py-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-left">
                    <p className="font-semibold leading-tight">{section.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'انقر لعرض التعليمات والفوائد' : 'Click to view instructions and benefits'}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 ps-1">
                  {section.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="rounded-lg border bg-muted/50 p-3">
                      <p className="font-medium leading-snug">{item.action}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.benefit}</p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
