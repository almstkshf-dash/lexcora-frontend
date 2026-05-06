/**
 * Injects missing General Settings i18n keys into en.json and ar.json
 * Run with: node inject-settings-i18n.js
 */
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'messages/en.json');
const arPath = path.join(__dirname, 'messages/ar.json');

const enNew = {
  // Page keys
  generalSettingsDesc: "Manage your company information, VAT configuration, and legal terms used across financial documents.",
  loadingSettings: "Loading settings...",
  errorFetchingSettings: "Failed to load settings. Please try again.",
  settingsUpdatedSuccessfully: "Settings updated successfully",
  errorUpdatingSettings: "Failed to update settings. Please try again.",
  back: "Back",
  companyInfo: "Company Info",
  // InfoTab keys
  companyInformation: "Company Information",
  companyInformationDesc: "This information appears on all financial documents and invoices.",
  companyNameAr: "Company Name (Arabic)",
  companyNameEn: "Company Name (English)",
  companyPhone: "Phone Number",
  companyEmail: "Email Address",
  trn: "Tax Registration Number (TRN)",
  defaultVatRate: "Default VAT Rate",
  addressAr: "Address (Arabic)",
  addressEn: "Address (English)",
  saving: "Saving...",
  saveChanges: "Save Changes",
  // Condiations keys
  termsAndConditions: "Terms & Conditions",
  termsAndConditionsDesc: "These terms appear at the bottom of invoices and financial documents.",
  textAr: "Arabic Text",
  textEn: "English Text",
};

const arNew = {
  // Page keys
  generalSettingsDesc: "إدارة معلومات شركتك وإعدادات ضريبة القيمة المضافة والشروط القانونية المستخدمة في المستندات المالية.",
  loadingSettings: "جاري تحميل الإعدادات...",
  errorFetchingSettings: "فشل تحميل الإعدادات. يرجى المحاولة مرة أخرى.",
  settingsUpdatedSuccessfully: "تم تحديث الإعدادات بنجاح",
  errorUpdatingSettings: "فشل تحديث الإعدادات. يرجى المحاولة مرة أخرى.",
  back: "رجوع",
  companyInfo: "معلومات الشركة",
  // InfoTab keys
  companyInformation: "معلومات الشركة",
  companyInformationDesc: "تظهر هذه المعلومات على جميع المستندات المالية والفواتير.",
  companyNameAr: "اسم الشركة (بالعربية)",
  companyNameEn: "اسم الشركة (بالإنجليزية)",
  companyPhone: "رقم الهاتف",
  companyEmail: "البريد الإلكتروني",
  trn: "رقم التسجيل الضريبي (TRN)",
  defaultVatRate: "نسبة ضريبة القيمة المضافة الافتراضية",
  addressAr: "العنوان (بالعربية)",
  addressEn: "العنوان (بالإنجليزية)",
  saving: "جاري الحفظ...",
  saveChanges: "حفظ التغييرات",
  // Condiations keys
  termsAndConditions: "الشروط والأحكام",
  termsAndConditionsDesc: "تظهر هذه الشروط في أسفل الفواتير والمستندات المالية.",
  textAr: "النص العربي",
  textEn: "النص الإنجليزي",
};

function injectKeys(filePath, newKeys) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (!json.settings) {
    json.settings = {};
  }

  let added = 0;
  for (const [key, value] of Object.entries(newKeys)) {
    if (!json.settings[key]) {
      json.settings[key] = value;
      added++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
  console.log(`✅ ${path.basename(filePath)}: added ${added} key(s)`);
}

injectKeys(enPath, enNew);
injectKeys(arPath, arNew);
console.log('Done.');
