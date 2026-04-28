"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  actions = null,
  icon: Icon = null,
  sticky = false,
  contextMeta = null, // { title?: string, lastSynced?: string, action?: ReactNode }
  children,
}) => {
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  const actionContent = actions || children;
  const containerRef = useRef(null);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const updateParallax = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // Normalize distance: 0 when near top, capped for subtle motion
      const distance = (rect.top - viewport * 0.35) / viewport;
      const clamped = Math.max(-1, Math.min(1, distance));
      setParallax(clamped * 20); // max ~20px translate
    };

    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    return () => {
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, []);

  const heroStyle = {
    '--hero-parallax': `${parallax.toFixed(2)}px`,
    '--hero-blur': `${Math.min(6, Math.abs(parallax) / 5).toFixed(2)}px`,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'hero-motion rounded-xl overflow-hidden',
        sticky
          ? 'sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60 py-3 mb-4'
          : 'mb-6 px-6 py-5 bg-card/40 border border-border/50 shadow-sm'
      )}
      style={heroStyle}
    >
      <div className="flex flex-col gap-4" data-hero-foreground>
        {breadcrumbs.length > 0 && (
          <nav
            aria-label={t('pageHeader.breadcrumb')}
            className={cn(
              'text-xs text-muted-foreground flex items-center flex-wrap gap-1 mb-1',
              isRTL ? 'justify-end' : 'justify-start'
            )}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const content = (
                <span className={isLast ? 'text-foreground font-medium' : 'hover:text-foreground'}>
                  {crumb.label}
                </span>
              );
              return (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                  {!isLast && <span className="text-muted-foreground opacity-50">/</span>}
                </span>
              );
            })}
          </nav>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/10 shadow-inner">
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1.5 font-medium opacity-90">{description}</p>
              )}
            </div>
          </div>

          {actionContent && (
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {actionContent}
            </div>
          )}
        </div>
      </div>

      {sticky && contextMeta && (contextMeta.title || contextMeta.lastSynced || contextMeta.action) && (
        <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {contextMeta.title && (
              <span className="font-semibold text-foreground">{contextMeta.title}</span>
            )}
            {contextMeta.lastSynced && (
              <span className="whitespace-nowrap">
                {contextMeta.lastSynced}
              </span>
            )}
          </div>
          {contextMeta.action && (
            <div className="flex items-center gap-2">
              {contextMeta.action}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
