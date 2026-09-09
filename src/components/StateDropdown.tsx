import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, MapPin } from 'lucide-react';
import { ALL_INDIAN_STATES, ALL_UNION_TERRITORIES } from '../data/indiaStates';

interface StateDropdownProps {
  value: string;
  onChange: (state: string) => void;
  className?: string;
  placeholder?: string;
}

export const StateDropdown: React.FC<StateDropdownProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'All States & UTs',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter states and union territories based on search
  const q = searchQuery.toLowerCase().trim();

  const filteredStates = ALL_INDIAN_STATES.filter(s =>
    s.toLowerCase().includes(q)
  );

  const filteredUTs = ALL_UNION_TERRITORIES.filter(ut =>
    ut.toLowerCase().includes(q)
  );

  // Flat list for keyboard navigation: "All States", then filtered states, then filtered UTs
  const flatOptions = [
    { label: 'All States (Entire India)', value: '', type: 'all' },
    ...filteredStates.map(s => ({ label: s, value: s, type: 'state' })),
    ...filteredUTs.map(ut => ({ label: ut, value: ut, type: 'ut' })),
  ];

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < flatOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : flatOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatOptions[highlightedIndex]) {
        handleSelect(flatOptions[highlightedIndex].value);
      }
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full min-w-[190px] sm:min-w-[220px] px-3.5 py-2 bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-800"
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-blue-800 shrink-0" />
          <span className="truncate">{value ? value : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-900' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          className="fixed sm:absolute z-50 left-4 right-4 sm:left-0 sm:right-auto sm:w-80 mt-1 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden text-xs flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-[380px]"
          style={{
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {/* Header Search Box */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder="Search State or UT (e.g. Tamil, Delhi, Ker)..."
              className="w-full py-1 text-xs bg-transparent border-none text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div ref={listRef} className="overflow-y-auto p-1.5 space-y-0.5 max-h-[300px]">
            {/* "All States" Option */}
            {(!q || 'all states'.includes(q) || 'entire india'.includes(q)) && (
              <button
                type="button"
                data-index={0}
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  value === ''
                    ? 'bg-blue-900 text-white'
                    : highlightedIndex === 0
                    ? 'bg-slate-800/80 text-blue-900'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🇮🇳</span>
                  <span>All States &amp; UTs (Entire India)</span>
                </span>
                {value === '' && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            )}

            {/* States Section */}
            {filteredStates.length > 0 && (
              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>States ({filteredStates.length})</span>
                </div>
                {filteredStates.map(stateName => {
                  const itemIndex = flatOptions.findIndex(
                    o => o.value === stateName
                  );
                  const isSelected = value === stateName;
                  const isHighlighted = highlightedIndex === itemIndex;

                  return (
                    <button
                      key={stateName}
                      type="button"
                      data-index={itemIndex}
                      onClick={() => handleSelect(stateName)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-white font-bold'
                          : isHighlighted
                          ? 'bg-blue-50 text-blue-950 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">{stateName}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Union Territories Section */}
            {filteredUTs.length > 0 && (
              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Union Territories ({filteredUTs.length})</span>
                </div>
                {filteredUTs.map(utName => {
                  const itemIndex = flatOptions.findIndex(
                    o => o.value === utName
                  );
                  const isSelected = value === utName;
                  const isHighlighted = highlightedIndex === itemIndex;

                  return (
                    <button
                      key={utName}
                      type="button"
                      data-index={itemIndex}
                      onClick={() => handleSelect(utName)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-white font-bold'
                          : isHighlighted
                          ? 'bg-blue-50 text-blue-950 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">{utName}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredStates.length === 0 && filteredUTs.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-xs">
                No state or union territory found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
