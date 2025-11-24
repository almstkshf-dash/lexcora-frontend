'use client';
import React from 'react';
import { 
  Palette, 
  Sun,
  Moon,
  Gem,
  Check,
  ChevronDown,
  Droplets,
  Flame,
  Zap,
  Flower2,
  Sparkles,
  Target,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSettings = () => {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const { theme, setTheme, themes } = useTheme();

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

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t('settings.theme')}
        </CardTitle>
        <CardDescription>
          {t('settings.themeDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>{t('settings.currentTheme')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.themeDescription')}
            </p>
          </div>
          <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="relative cursor-pointer flex items-center gap-2 h-10 px-4 min-w-[180px] justify-between"
              >
                <div className="flex items-center gap-2">
                  {getThemeIcon(theme)}
                  <span className="text-sm">
                    {getThemeLabel(theme)}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.light)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Sun className="h-4 w-4" />
                <span className="flex-1">{t("theme.light")}</span>
                {theme === themes.light && <Check className="h-4 w-4 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.dark)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Moon className="h-4 w-4" />
                <span className="flex-1">{t("theme.dark")}</span>
                {theme === themes.dark && <Check className="h-4 w-4 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.blue)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Palette className="h-4 w-4" />
                <span className="flex-1">{t("theme.blue")}</span>
                {theme === themes.blue && <Check className="h-4 w-4 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.blueNew)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Droplets className="h-4 w-4" />
                <span className="flex-1">{t("theme.blueNew")}</span>
                {theme === themes.blueNew && <Check className="h-4 w-4 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.green)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Flower2 className="h-4 w-4" />
                <span className="flex-1">{t("theme.green")}</span>
                {theme === themes.green && <Check className="h-4 w-4 text-green-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.orange)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Flame className="h-4 w-4" />
                <span className="flex-1">{t("theme.orange")}</span>
                {theme === themes.orange && <Check className="h-4 w-4 text-orange-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.orangeGold)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Gem className="h-4 w-4" />
                <span className="flex-1">{t("theme.orangeGold")}</span>
                {theme === themes.orangeGold && <Check className="h-4 w-4 text-orange-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.violet)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span className="flex-1">{t("theme.violet")}</span>
                {theme === themes.violet && <Check className="h-4 w-4 text-violet-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.yellow)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Sun className="h-4 w-4 fill-current" />
                <span className="flex-1">{t("theme.yellow")}</span>
                {theme === themes.yellow && <Check className="h-4 w-4 text-yellow-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.rose)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Flower2 className="h-4 w-4" />
                <span className="flex-1">{t("theme.rose")}</span>
              {theme === themes.rose && <Check className="h-4 w-4 text-rose-600" />}
            </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.calm)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Wind className="h-4 w-4" />
                <span className="flex-1">{t("theme.calm")}</span>
                {theme === themes.calm && <Check className="h-4 w-4 text-sky-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.focus)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Target className="h-4 w-4" />
                <span className="flex-1">{t("theme.focus")}</span>
                {theme === themes.focus && <Check className="h-4 w-4 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleThemeChange(themes.vibrant)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span className="flex-1">{t("theme.vibrant")}</span>
                {theme === themes.vibrant && <Check className="h-4 w-4 text-pink-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('settings.ambientThemeHint')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
