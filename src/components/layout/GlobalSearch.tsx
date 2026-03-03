import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GLOBAL_SEARCH_ITEMS } from '../../data/globalSearchData';
import type { SearchResultItem, SearchResultType } from '../../data/globalSearchData';

const RECENT_SEARCHES_KEY = 'ah-global-search-recent-v1';
const MAX_RECENT_SEARCHES = 7;

interface RecentSearch {
  query: string;
  timestamp: number;
}

const getTypeColor = (type: SearchResultType): string => {
  switch (type) {
    case 'report':
      return '#2563eb';
    case 'order':
      return '#3b82f6';
    case 'supplier':
      return '#10b981';
    case 'subsidiary':
      return '#f59e0b';
    default:
      return '#64748b';
  }
};

const getTypeBgColor = (type: SearchResultType): string => {
  switch (type) {
    case 'report':
      return '#eef2ff';
    case 'order':
      return '#f5f3ff';
    case 'supplier':
      return '#f0fdf4';
    case 'subsidiary':
      return '#fffbeb';
    default:
      return '#f1f5f9';
  }
};

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResultItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentSearch[];
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: RecentSearch[]) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, []);

  // Add to recent searches
  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches((prev) => {
      // Remove duplicates and add to top
      const filtered = prev.filter((s) => s.query.toLowerCase() !== searchQuery.toLowerCase());
      const updated = [{ query: searchQuery, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  }, [saveRecentSearches]);

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      setHighlightedIndex(-1);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const startsWithMatches: SearchResultItem[] = [];
    const containsMatches: SearchResultItem[] = [];

    GLOBAL_SEARCH_ITEMS.forEach((item) => {
      const labelMatch = item.label.toLowerCase().includes(lowerQuery);
      const descMatch = item.description?.toLowerCase().includes(lowerQuery);
      
      if (labelMatch || descMatch) {
        if (item.label.toLowerCase().startsWith(lowerQuery)) {
          startsWithMatches.push(item);
        } else {
          containsMatches.push(item);
        }
      }
    });

    // Sort: startsWith first, then contains
    const sorted = [...startsWithMatches, ...containsMatches].slice(0, 10);
    setFilteredResults(sorted);
    setHighlightedIndex(-1);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredResults.length) {
          handleSelectResult(filteredResults[highlightedIndex]);
        } else if (query.trim()) {
          // Generic search action
          addToRecentSearches(query);
          console.log('Search for:', query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleSelectResult = (item: SearchResultItem) => {
    addToRecentSearches(item.label);
    setQuery(item.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    if (item.route) {
      // TODO: Hook this to actual router when available
      console.log('Navigate to', item.route);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    addToRecentSearches(recentQuery);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div ref={containerRef} className="global-search-container">
      <div className="topbar-search">
        <svg
          className="topbar-search-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search reports, orders, suppliers…"
          className={`topbar-search-input ${isOpen ? 'topbar-search-input--focused' : ''}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && (
        <div className="global-search-dropdown">
          {!query.trim() ? (
            // Recent searches view
            <div className="global-search-section">
              <div className="global-search-section-header">
                <span className="global-search-section-title">Recent searches</span>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    className="global-search-clear-button"
                    onClick={handleClearRecent}
                  >
                    Clear
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                <div className="global-search-list">
                  {recentSearches.map((recent) => (
                    <button
                      key={`${recent.query}-${recent.timestamp}`}
                      type="button"
                      className="global-search-item global-search-item--recent"
                      onClick={() => handleRecentSearchClick(recent.query)}
                      onMouseEnter={() => setHighlightedIndex(-1)}
                    >
                      <span className="global-search-item-label">{recent.query}</span>
                      <span className="global-search-item-meta">{formatRelativeTime(recent.timestamp)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="global-search-empty">
                  No recent searches yet. Try searching for a report, order number, or supplier.
                </div>
              )}
            </div>
          ) : (
            // Results view
            <div className="global-search-section">
              <div className="global-search-section-header">
                <span className="global-search-section-title">Results</span>
              </div>
              {filteredResults.length > 0 ? (
                <div className="global-search-list">
                  {filteredResults.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`global-search-item ${
                        index === highlightedIndex ? 'global-search-item--highlighted' : ''
                      }`}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="global-search-item-content">
                        <div className="global-search-item-header">
                          <span
                            className="global-search-type-badge"
                            style={{
                              backgroundColor: getTypeBgColor(item.type),
                              color: getTypeColor(item.type),
                            }}
                          >
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className="global-search-item-label">{item.label}</span>
                        </div>
                        {item.description && (
                          <span className="global-search-item-description">{item.description}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="global-search-empty">
                  No results for "{query}" yet. Try another search or use the report filters below.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

