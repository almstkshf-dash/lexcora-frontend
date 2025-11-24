'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder, 
  onClear, 
  onFocus, 
  isRTL,
  typeSelector,
  inputId = 'global-search',
  inputName = 'global-search'
}) => {
  return (
    <div className="relative">
      <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <input
        type="text"
        id={inputId}
        name={inputName}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className={`
          flex h-11 w-full rounded-md border border-input bg-background
          ${isRTL ? 'pr-11 pl-[180px]' : 'pl-11 pr-[180px]'}
          py-2 text-sm ring-offset-background
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
        `}
      />
      
      <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center gap-2`}>
        {typeSelector && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="pointer-events-auto">
              {typeSelector}
            </div>
          </>
        )}
        
        {searchQuery && (
          <>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1 rounded-sm hover:bg-accent"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
