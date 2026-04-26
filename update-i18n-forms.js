const fs = require('fs');

const arPath = 'c:/Users/ceo/OneDrive/Desktop/ليكسورا/lexcora/lexcora-frontend/src/messages/ar.json';
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

if (!ar.forms) ar.forms = {};
Object.assign(ar.forms, {
  "validationSummaryTitle": "يرجى تصحيح هذه الحقول",
  "validationSummaryHint": "قمنا بتحديد ما يحتاج إلى انتباهك حتى تتمكن من المتابعة.",
  "autosaveSaving": "جاري حفظ المسودة...",
  "autosaveSaved": "تم حفظ المسودة",
  "autosaveRestored": "تم استعادة المسودة",
  "autosaveIdle": "الحفظ التلقائي مفعل",
  "lastSavedAt": "آخر حفظ في",
  "clearDraft": "تجاهل المسودة"
});

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
console.log('ar.json forms updated');
