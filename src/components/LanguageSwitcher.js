"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage, languages, getLanguageLabel, isRTL } = useLanguage();
  const { t } = useTranslations();

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const switchLabel = t("language.switch") || (isRTL ? "تغيير اللغة" : "Switch language");
  const arabicLabel = getLanguageLabel(languages.ar) || "العربية";
  const englishLabel = getLanguageLabel(languages.en) || "English";

  return (
    <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative cursor-pointer flex items-center gap-2 h-9 px-3"
          aria-label={switchLabel}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block text-sm">
            {getLanguageLabel(language)}
          </span>
          <span className="sr-only">
            {switchLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={() => handleLanguageChange(languages.ar)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Globe className="h-4 w-4" />
          <span className="flex-1">{arabicLabel}</span>
          {language === languages.ar && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange(languages.en)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Globe className="h-4 w-4" />
          <span className="flex-1">{englishLabel}</span>
          {language === languages.en && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
