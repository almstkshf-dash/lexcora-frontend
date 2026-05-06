# Lexcora I18n & RTL Standard Workflow

To ensure consistent support for both Arabic (RTL) and English (LTR) and to prevent recurrence of layout errors, all development must adhere to these constants.

## 1. Text Direction & Alignment
- **NEVER** use physical direction classes for margins, padding, or alignment unless absolute positioning requires it.
- **ALWAYS** use Logical Properties (supported by Tailwind 4):
  - `ml-*` → `ms-*` (Margin Start)
  - `mr-*` → `me-*` (Margin End)
  - `pl-*` → `ps-*` (Padding Start)
  - `pr-*` → `pe-*` (Padding End)
  - `text-left` → `text-start`
  - `text-right` → `text-end`
  - `left-*` → `inset-inline-start-*`
  - `right-*` → `inset-inline-end-*`
  - `border-l-*` → `border-s-*`
  - `border-r-*` → `border-e-*`
  - `rounded-l-*` → `rounded-s-*`
  - `rounded-r-*` → `rounded-e-*`

## 2. Flexbox & Grid
- Avoid `flex-row-reverse` unless the logic specifically requires it. The `dir="rtl"` attribute handles the reversal of flex children automatically if they are in a standard `flex-row`.
- If a custom reversal is needed based on language, use `isRTL` from `useLanguage()` context.

## 3. Tables & Forms
- Table headers (`<th>`) should generally use `text-start` to align with the text direction.
- Numeric columns in tables should often be `text-end` (consistent across languages) or explicitly handled if they flip.
- Form labels must always be `text-start`.

## 4. Popups & Modals
- Ensure all modals and popups inherit the `dir` attribute from `body`.
- If using portals that render outside the main DOM tree, explicitly pass `dir={isRTL ? 'rtl' : 'ltr'}` to the container.

## 5. Reports (Exported & Printed)
- **Printed Reports (`window.print()`):** Use the `.print-only` and `.print-hide` classes. Ensure the global RTL styles in `globals.css` are preserved during print.
- **PDF Exports (`jspdf`):** 
  - Always use `NotoSansArabic` font for Arabic text.
  - For tabular data, **reverse the column order** if the user is in Arabic mode to ensure the first column appears on the right.
  - Use `halign: 'right'` for Arabic cells.

## 6. Icon Directions
- Icons that indicate direction (e.g., `ChevronRight`, `ArrowRight`) should be flipped in RTL.
- Use a helper or conditional class: `className={cn(isRTL && "rotate-180")}`.

## 7. Development Checklist
1. [ ] Check layout in both Arabic and English.
2. [ ] Verify that no `mr-`, `ml-`, `pr-`, `pl-` classes are used.
3. [ ] Verify that icons are correctly oriented.
4. [ ] Test the "Print" and "Export" functionality in Arabic.
