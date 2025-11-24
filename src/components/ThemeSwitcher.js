"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Palette, Check, Gem, Droplets, Flame, Zap, Flower2, Sparkles, Target, Wind } from "lucide-react";

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const { isRTL } = useLanguage();
  const { t } = useTranslations();

  const getThemeIcon = (currentTheme) => {
    switch (currentTheme) {
      case themes.dark:
        return <Moon className="h-4 w-4" />;
      case themes.blue:
        return <Palette className="h-4 w-4" />;
      case themes.blueNew:
        return <Droplets className="h-4 w-4" />;
      case themes.green:
        return <Flower2 className="h-4 w-4" />;
      case themes.orange:
        return <Flame className="h-4 w-4" />;
      case themes.orangeGold:
        return <Gem className="h-4 w-4" />;
      case themes.violet:
        return <Zap className="h-4 w-4" />;
      case themes.yellow:
        return <Sun className="h-4 w-4 fill-current" />;
      case themes.rose:
        return <Flower2 className="h-4 w-4" />;
      case themes.calm:
        return <Wind className="h-4 w-4" />;
      case themes.focus:
        return <Target className="h-4 w-4" />;
      case themes.vibrant:
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (currentTheme) => {
    switch (currentTheme) {
      case themes.dark:
        return t("theme.dark");
      case themes.blue:
        return t("theme.blue");
      case themes.blueNew:
        return t("theme.blueNew");
      case themes.green:
        return t("theme.green");
      case themes.orange:
        return t("theme.orange");
      case themes.orangeGold:
        return t("theme.orangeGold");
      case themes.violet:
        return t("theme.violet");
      case themes.yellow:
        return t("theme.yellow");
      case themes.rose:
        return t("theme.rose");
      case themes.calm:
        return t("theme.calm");
      case themes.focus:
        return t("theme.focus");
      case themes.vibrant:
        return t("theme.vibrant");
      default:
        return t("theme.light");
    }
  };

  return (
    <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative cursor-pointer flex items-center gap-2 h-9 px-3"
        >
          {getThemeIcon(theme)}
          <span className="hidden sm:inline-block text-sm">
            {getThemeLabel(theme)}
          </span>
          <span className="sr-only">{t("theme.switchTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem 
          onClick={() => setTheme(themes.light)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span className="flex-1">{t("theme.light")}</span>
          {theme === themes.light && <Check className="h-4 w-4 text-blue-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.dark)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span className="flex-1">{t("theme.dark")}</span>
          {theme === themes.dark && <Check className="h-4 w-4 text-blue-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.blue)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Palette className="h-4 w-4" />
          <span className="flex-1">{t("theme.blue")}</span>
          {theme === themes.blue && <Check className="h-4 w-4 text-blue-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.blueNew)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Droplets className="h-4 w-4" />
          <span className="flex-1">{t("theme.blueNew")}</span>
          {theme === themes.blueNew && <Check className="h-4 w-4 text-blue-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.green)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Flower2 className="h-4 w-4" />
          <span className="flex-1">{t("theme.green")}</span>
          {theme === themes.green && <Check className="h-4 w-4 text-green-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.orange)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Flame className="h-4 w-4" />
          <span className="flex-1">{t("theme.orange")}</span>
          {theme === themes.orange && <Check className="h-4 w-4 text-orange-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.orangeGold)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Gem className="h-4 w-4" />
          <span className="flex-1">{t("theme.orangeGold")}</span>
          {theme === themes.orangeGold && <Check className="h-4 w-4 text-orange-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.violet)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Zap className="h-4 w-4" />
          <span className="flex-1">{t("theme.violet")}</span>
          {theme === themes.violet && <Check className="h-4 w-4 text-violet-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.yellow)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Sun className="h-4 w-4 fill-current" />
          <span className="flex-1">{t("theme.yellow")}</span>
          {theme === themes.yellow && <Check className="h-4 w-4 text-yellow-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.rose)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Flower2 className="h-4 w-4" />
          <span className="flex-1">{t("theme.rose")}</span>
          {theme === themes.rose && <Check className="h-4 w-4 text-rose-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.calm)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Wind className="h-4 w-4" />
          <span className="flex-1">{t("theme.calm")}</span>
          {theme === themes.calm && <Check className="h-4 w-4 text-sky-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.focus)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Target className="h-4 w-4" />
          <span className="flex-1">{t("theme.focus")}</span>
          {theme === themes.focus && <Check className="h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(themes.vibrant)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span className="flex-1">{t("theme.vibrant")}</span>
          {theme === themes.vibrant && <Check className="h-4 w-4 text-pink-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
