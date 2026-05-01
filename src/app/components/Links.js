import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export function Links() {
  const { language, isRTL } = useLanguage();
  const t = useTranslations('navigation');
  
  // Use flex-row-reverse for RTL and regular flex-row for LTR
  const rtlClass = isRTL ? 'rtl' : 'ltr';
  
  return (
    <Breadcrumb className={rtlClass}>
      <BreadcrumbList className={isRTL ? 'flex-row-reverse' : ''}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t('dashboard')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/components">{t('components') || 'Components'}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('breadcrumb') || 'Breadcrumb'}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}



