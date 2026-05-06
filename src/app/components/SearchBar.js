'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { appLinks } from '@/data/appLinks';
import { performSearch } from '@/app/services/api/search';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchType, setSearchType] = useState('system'); // system, cases, parties, clients
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  const lang = isRTL ? 'ar' : 'en';

  // Search based on type
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResults([]);
      setIsOpen(false);
      return;
    }

    const performSearchAction = async () => {
      setIsSearching(true);
      // Open the dropdown before the async work so the loading state is visible
      // and the no-results panel always renders even when the API throws.
      setIsOpen(true);
      try {
        if (searchType === 'system') {
          // Search app links (existing functionality)
          const query = searchQuery.toLowerCase();
          const filtered = appLinks.filter(link => {
            const label = link.label[lang].toLowerCase();
            const category = link.category[lang].toLowerCase();
            const keywords = link.keywords[lang].map(k => k.toLowerCase());

            return (
              label.includes(query) ||
              category.includes(query) ||
              keywords.some(keyword => keyword.includes(query))
            );
          });
          setFilteredResults(filtered);
        } else {
          // Use API service for cases, parties, and clients
          const results = await performSearch(searchQuery, searchType);
          setFilteredResults(results);
        }
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      performSearchAction();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchType, lang]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleItemClick(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    let route = '';
    
    if (searchType === 'system') {
      route = item.route;
    } else if (searchType === 'cases') {
      route = `/cases/${item.id}/edit`;
    } else if (searchType === 'parties') {
      route = `/parties/${item.id}`;
    } else if (searchType === 'clients') {
      route = `/clients/${item.id}`;
    }

    router.push(route);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'cases':  return t('search.placeholderByFileOrCase');
      case 'parties': return t('search.placeholderForParty');
      case 'clients': return t('search.placeholderForClient');
      default:        return t('common.searchPages');
    }
  };

  // Shared result item button class builder
  const resultItemClass = (index) => `
    w-full px-4 py-3
    text-${isRTL ? 'right' : 'left'}
    hover:bg-gray-50 dark:hover:bg-gray-700
    transition-colors
    border-b border-gray-100 dark:border-gray-700 last:border-b-0
    ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
  `;

  const renderResultItem = (item, index) => {
    let title = '';
    let subtitle = null;

    if (searchType === 'system') {
      title = item.label[lang];
      subtitle = item.category[lang];
    } else if (searchType === 'cases') {
      title = item.topic || t('search.noTopic');
      subtitle = (
        <div className="flex gap-2">
          <span>{t('search.fileLabel')} {item.file_number || '-'}</span>
          <span>{t('search.caseLabel')} {item.case_number || '-'}</span>
        </div>
      );
    } else if (searchType === 'parties' || searchType === 'clients') {
      title = item.name || t('search.unnamed');
      subtitle = searchType === 'parties'
        ? (item.phone || item.national_id || item.e_id || '-')
        : (item.phone || '-');
    } else {
      return null;
    }

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        onMouseEnter={() => setSelectedIndex(index)}
        className={resultItemClass(index)}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Search Input and Radio Buttons - Inline */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Search Type Filters */}
        <div className={`flex gap-1.5 z-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {[
            { value: 'system',  labelKey: 'search.filterSystem' },
            { value: 'cases',   labelKey: 'search.filterCases' },
            { value: 'parties', labelKey: 'search.filterParty' },
            { value: 'clients', labelKey: 'search.filterClient' },
          ].map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setSearchType(value)}
              className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                searchType === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
        <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery && filteredResults.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          aria-label={getPlaceholder()}
          className={`
            w-full
            ${isRTL ? 'pr-11 pl-10' : 'pl-11 pr-10'}
            py-2.5
            text-sm
            border
            border-gray-200
            dark:border-gray-700
            rounded-lg
            bg-gray-50
            dark:bg-gray-800
            text-gray-900
            dark:text-gray-100
            placeholder-gray-500
            dark:placeholder-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            dark:focus:ring-blue-600
            focus:border-transparent
            focus:bg-white
            dark:focus:bg-gray-750
            transition-all
            duration-200
            hover:bg-white
            dark:hover:bg-gray-750
          `}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            aria-label={t('common.clearSearch')}
            className={`
              absolute
              inset-y-0
              ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}
              flex
              items-center
              text-gray-400
              hover:text-gray-600
              dark:hover:text-gray-300
              transition-colors
              focus:outline-none
            `}
          >
            <span className="sr-only">{t('common.clearSearch')}</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredResults.length > 0 && (
        <div
          ref={dropdownRef}
          className={`
            absolute
            ${isRTL ? 'right-0' : 'left-0'}
            w-full
            mt-2
            bg-white
            dark:bg-gray-800
            border
            border-gray-200
            dark:border-gray-700
            rounded-lg
            shadow-lg
            max-h-96
            overflow-y-auto
            z-50
          `}
        >
          {filteredResults.map((item, index) => renderResultItem(item, index))}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div
          className={`
            absolute
            ${isRTL ? 'right-0' : 'left-0'}
            w-full
            mt-2
            bg-white
            dark:bg-gray-800
            border
            border-gray-200
            dark:border-gray-700
            rounded-lg
            shadow-lg
            px-4
            py-6
            text-center
            z-50
          `}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.loading')}
          </p>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isSearching && searchQuery && filteredResults.length === 0 && (
        <div
          className={`
            absolute
            ${isRTL ? 'right-0' : 'left-0'}
            w-full
            mt-2
            bg-white
            dark:bg-gray-800
            border
            border-gray-200
            dark:border-gray-700
            rounded-lg
            shadow-lg
            px-4
            py-6
            text-center
            z-20
          `}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.noResultsFound')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
