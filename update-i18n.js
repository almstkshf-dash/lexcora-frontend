const fs = require('fs');

const enPath = 'c:/Users/ceo/OneDrive/Desktop/ليكسورا/lexcora/lexcora-frontend/src/messages/en.json';
const arPath = 'c:/Users/ceo/OneDrive/Desktop/ليكسورا/lexcora/lexcora-frontend/src/messages/ar.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

// Update EN
if (!en.caseTypes) en.caseTypes = {};
Object.assign(en.caseTypes, {
  "pleaseFillBothNames": "Please fill in both Arabic and English names.",
  "failedToCreateCaseType": "Failed to create case type.",
  "caseTypeCreatedSuccessfully": "Case type created successfully.",
  "failedToLoadCaseTypes": "Failed to load case types.",
  "loadingCaseTypes": "Loading case types...",
  "selectCaseType": "Select Case Type",
  "addNewCaseType": "Add New Case Type",
  "arabicName": "Arabic Name",
  "enterArabicName": "Enter Arabic name",
  "englishName": "English Name",
  "enterEnglishName": "Enter English name",
  "creating": "Creating...",
  "createCaseType": "Create Case Type",
  "permissionCreate": "You do not have permission to create a case type.",
  "permissionView": "You do not have permission to view case types."
});

if (!en.caseClassifications) en.caseClassifications = {};
Object.assign(en.caseClassifications, {
  "pleaseFillBothNames": "Please fill in both Arabic and English names.",
  "failedToCreateCaseClassification": "Failed to create case classification.",
  "caseClassificationCreatedSuccessfully": "Case classification created successfully.",
  "failedToLoadCaseClassifications": "Failed to load case classifications.",
  "loadingCaseClassifications": "Loading case classifications...",
  "selectCaseClassification": "Select Case Classification",
  "addNewCaseClassification": "Add New Case Classification",
  "arabicName": "Arabic Name",
  "enterArabicName": "Enter Arabic name",
  "englishName": "English Name",
  "enterEnglishName": "Enter English name",
  "creating": "Creating...",
  "createCaseClassification": "Create Case Classification",
  "permissionCreate": "You do not have permission to create a case classification.",
  "permissionView": "You do not have permission to view case classifications."
});

if (!en.counterClaim) en.counterClaim = {};
Object.assign(en.counterClaim, {
  "title": "Counter Case",
  "caseNumberPlaceholder": "Select counter case",
  "searchPlaceholder": "Search by case or file number...",
  "searching": "Searching...",
  "noResults": "No results found",
  "minCharactersSearch": "Type at least 3 characters to search",
  "caseLabel": "Case:",
  "fileLabel": "File:",
  "topicLabel": "Topic:"
});

if (!en.sessions) en.sessions = {};
Object.assign(en.sessions, {
  "clickOrDragFiles": "Click or drag files here",
  "pdfDocTxtImages": "PDF, DOC, TXT, Images up to 10MB",
  "noFilesUploaded": "No files uploaded yet"
});

if (!en.branches) en.branches = {};
Object.assign(en.branches, {
  "pleaseFillBothNames": "Please fill in both Arabic and English names.",
  "failedToCreateBranch": "Failed to create branch.",
  "branchCreatedSuccessfully": "Branch created successfully.",
  "failedToLoadBranches": "Failed to load branches.",
  "loadingBranches": "Loading branches...",
  "selectBranch": "Select Branch",
  "addNewBranch": "Add New Branch",
  "arabicName": "Arabic Name",
  "enterArabicName": "Enter Arabic name",
  "englishName": "English Name",
  "enterEnglishName": "Enter English name",
  "creating": "Creating...",
  "createBranch": "Create Branch"
});

// Update AR
if (!ar.caseTypes) ar.caseTypes = {};
Object.assign(ar.caseTypes, {
  "pleaseFillBothNames": "يرجى ملء الاسم باللغتين العربية والإنجليزية.",
  "failedToCreateCaseType": "فشل إنشاء نوع القضية.",
  "caseTypeCreatedSuccessfully": "تم إنشاء نوع القضية بنجاح.",
  "failedToLoadCaseTypes": "فشل تحميل أنواع القضايا.",
  "loadingCaseTypes": "جاري تحميل أنواع القضايا...",
  "selectCaseType": "اختر نوع القضية",
  "addNewCaseType": "إضافة نوع قضية جديد",
  "arabicName": "الاسم بالعربية",
  "enterArabicName": "أدخل الاسم بالعربية",
  "englishName": "الاسم بالإنجليزية",
  "enterEnglishName": "أدخل الاسم بالإنجليزية",
  "creating": "جاري الإنشاء...",
  "createCaseType": "إنشاء نوع القضية",
  "permissionCreate": "ليس لديك صلاحية لإنشاء نوع قضية.",
  "permissionView": "ليس لديك صلاحية لعرض أنواع القضايا."
});

if (!ar.caseClassifications) ar.caseClassifications = {};
Object.assign(ar.caseClassifications, {
  "pleaseFillBothNames": "يرجى ملء الاسم باللغتين العربية والإنجليزية.",
  "failedToCreateCaseClassification": "فشل إنشاء تصنيف القضية.",
  "caseClassificationCreatedSuccessfully": "تم إنشاء تصنيف القضية بنجاح.",
  "failedToLoadCaseClassifications": "فشل تحميل تصنيفات القضايا.",
  "loadingCaseClassifications": "جاري تحميل تصنيفات القضايا...",
  "selectCaseClassification": "اختر تصنيف القضية",
  "addNewCaseClassification": "إضافة تصنيف قضية جديد",
  "arabicName": "الاسم بالعربية",
  "enterArabicName": "أدخل الاسم بالعربية",
  "englishName": "الاسم بالإنجليزية",
  "enterEnglishName": "أدخل الاسم بالإنجليزية",
  "creating": "جاري الإنشاء...",
  "createCaseClassification": "إنشاء تصنيف القضية",
  "permissionCreate": "ليس لديك صلاحية لإنشاء تصنيف قضية.",
  "permissionView": "ليس لديك صلاحية لعرض تصنيفات القضايا."
});

if (!ar.counterClaim) ar.counterClaim = {};
Object.assign(ar.counterClaim, {
  "title": "القضية المرتبطة / الدعوى المتقابلة",
  "caseNumberPlaceholder": "اختر القضية المتقابلة",
  "searchPlaceholder": "ابحث برقم القضية أو الملف...",
  "searching": "جاري البحث...",
  "noResults": "لا توجد نتائج",
  "minCharactersSearch": "اكتب 3 أحرف على الأقل للبحث",
  "caseLabel": "قضية:",
  "fileLabel": "ملف:",
  "topicLabel": "موضوع:"
});

if (!ar.sessions) ar.sessions = {};
Object.assign(ar.sessions, {
  "clickOrDragFiles": "انقر أو اسحب الملفات هنا",
  "pdfDocTxtImages": "PDF, DOC, TXT, صور بحجم يصل إلى 10 ميغابايت",
  "noFilesUploaded": "لا يوجد ملفات مرفوعة"
});

if (!ar.branches) ar.branches = {};
Object.assign(ar.branches, {
  "pleaseFillBothNames": "يرجى ملء الاسم باللغتين العربية والإنجليزية.",
  "failedToCreateBranch": "فشل إنشاء الفرع.",
  "branchCreatedSuccessfully": "تم إنشاء الفرع بنجاح.",
  "failedToLoadBranches": "فشل تحميل الفروع.",
  "loadingBranches": "جاري تحميل الفروع...",
  "selectBranch": "اختر الفرع",
  "addNewBranch": "إضافة فرع جديد",
  "arabicName": "الاسم بالعربية",
  "enterArabicName": "أدخل الاسم بالعربية",
  "englishName": "الاسم بالإنجليزية",
  "enterEnglishName": "أدخل الاسم بالإنجليزية",
  "creating": "جاري الإنشاء...",
  "createBranch": "إنشاء فرع"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
