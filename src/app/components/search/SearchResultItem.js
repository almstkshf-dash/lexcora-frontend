'use client';

import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { FileText, User, UserCheck, ChevronRight, ChevronLeft } from 'lucide-react';

const SearchResultItem = ({ 
  item, 
  index, 
  searchType, 
  isSelected, 
  onClick, 
  onMouseEnter, 
  isRTL, 
  lang 
}) => {
  const t = useTranslations();
  const renderContent = () => {
    if (searchType === 'system') {
      return (
        <>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.label[lang]}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.category[lang]}
              </span>
            </div>
          </div>
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </>
      );
    }

    if (searchType === 'cases') {
      return (
        <>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.topic || t('search.noTopic')}
              </span>
              <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">{t('fileLabel')} {item.file_number || '-'}</span>
                <span className="truncate">{t('caseLabel')} {item.case_number || '-'}</span>
              </div>
            </div>
          </div>
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </>
      );
    }

    if (searchType === 'parties') {
      return (
        <>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.name || t('search.unnamed')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.phone || item.national_id || item.e_id || '-'}
              </span>
            </div>
          </div>
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </>
      );
    }

    if (searchType === 'clients') {
      return (
        <>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.name || t('search.unnamed')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.phone || '-'}
              </span>
            </div>
          </div>
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </>
      );
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        w-full
        px-4
        py-3
        flex
        items-center
        gap-3
        ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}
        transition-all
        duration-150
        border-b
        border-gray-100
        dark:border-gray-700
        last:border-b-0
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500 dark:border-l-blue-400' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }
      `}
    >
      {renderContent()}
    </button>
  );
};

export default SearchResultItem;
