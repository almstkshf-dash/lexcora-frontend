"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  actions = null,
  icon: Icon = null,
  sticky = false,
  children,
}) => {
  const { isRTL } = useLanguage();
  const actionContent = actions || children;

  return (
    <div
      className={cn(
        sticky
          ? 'sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60 py-3 mb-4'
          : 'mb-6'
      )}
    >
      <div className="flex flex-col gap-3">
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              'text-xs text-muted-foreground flex items-center flex-wrap gap-1',
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
                  {!isLast && <span className="text-muted-foreground">/</span>}
                </span>
              );
            })}
          </nav>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/10">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl font-semibold text-foreground leading-tight">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>

          {actionContent && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {actionContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
