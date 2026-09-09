import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, Building2, MapPin, Layers } from 'lucide-react';
import { clientLocationService, CombinedLocationItem } from '../services/locationService';

interface DistrictCityDropdownProps {
  selectedState: string;
  value: string;
  onChange: (locationName: string, locationType?: 'district' | 'city' | 'town') => void;
  className?: string;
  placeholder?: string;
}

export const DistrictCityDropdown: React.FC<DistrictCityDropdownProps> = ({
  selectedState,
  value,
  onChange,
  className = '',
  placeholder = 'All Cities / Districts',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [locations, setLocations] = useState<CombinedLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load locations whenever selectedState changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedState) {
      setLocations([]);
      return;
    }

    setIsLoading(true);
    clientLocationService.getCombinedLocations(selectedState)
      .then(items => {
        if (isMounted) {
          setLocations(items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  // Filter based on search query
  const q = searchQuery.toLowerCase().trim();
  const filtered = locations.filter(loc =>
    !q || loc.name.toLowerCase().includes(q)
  );

  const districts = filtered.filter(l => l.type === 'district');
  const cities = filtered.filter(l => l.type === 'city' || l.type === 'town');

  // Flat list for keyboard navigation
  const flatOptions = [
    { label: selectedState ? `All Cities & Districts in ${selectedState}` : 'All Cities & Districts', value: '', type: 'all' },
    ...districts.map(d => ({ label: d.name, value: d.name, type: 'district' })),
    ...cities.map(c => ({ label: c.name, value: c.name, type: 'city' })),
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
      if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && selectedState) {
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
        const item = flatOptions[highlightedIndex];
        onChange(item.value, item.type as any);
        setIsOpen(false);
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

  const handleSelect = (val: string, type?: 'district' | 'city' | 'town') => {
    onChange(val, type);
    setIsOpen(false);
  };

  const isDisabled = !selectedState;

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id="filter-district-select-btn"
        type="button"
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs transition-all ${
          isDisabled
            ? 'bg-slate-800/80 text-slate-400 border-slate-700 cursor-not-allowed'
            : 'bg-slate-900 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-800'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className={`w-3.5 h-3.5 shrink-0 ${isDisabled ? 'text-slate-300' : 'text-blue-800'}`} />
          <span className="truncate">
            {value ? value : isDisabled ? 'Select a State First' : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {value && !isDisabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('');
              }}
              className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-300 cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-900' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && !isDisabled && (
        <div
          role="listbox"
          className="fixed sm:absolute z-50 left-4 right-4 sm:left-0 sm:right-auto sm:w-84 mt-1 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden text-xs flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-[380px]"
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
              placeholder={`Search in ${selectedState} (e.g. Guntur, Tirupati)...`}
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

          {/* Context Stats Bar */}
          <div className="px-3 py-1 bg-blue-50/60 border-b border-blue-100/50 flex items-center justify-between text-[10px] text-blue-900 font-medium">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-700" />
              <span>{selectedState} Locations</span>
            </span>
            <span className="text-slate-500 font-mono">
              {districts.length} Districts • {cities.length} Cities
            </span>
          </div>

          {/* Options List */}
          <div ref={listRef} className="overflow-y-auto p-1.5 space-y-0.5 max-h-[300px]">
            {isLoading ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                <span>Loading official districts &amp; cities...</span>
              </div>
            ) : (
              <>
                {/* "All Cities / Districts" Option */}
                {(!q || 'all cities districts'.includes(q)) && (
                  <button
                    type="button"
                    data-index={0}
                    onClick={() => handleSelect('')}
                    className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between cursor-pointer transition-colors ${
                      value === ''
                        ? 'bg-blue-900 text-white'
                        : highlightedIndex === 0
                        ? 'bg-slate-800/80 text-blue-900'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>All Cities &amp; Districts in {selectedState}</span>
                    </span>
                    {value === '' && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                )}

                {/* Official Districts Section */}
                {districts.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Official Districts ({districts.length})</span>
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Administrative
                      </span>
                    </div>
                    {districts.map(dist => {
                      const itemIndex = flatOptions.findIndex(
                        o => o.value === dist.name && o.type === 'district'
                      );
                      const isSelected = value === dist.name;
                      const isHighlighted = highlightedIndex === itemIndex;

                      return (
                        <button
                          key={`dist-${dist.id}`}
                          type="button"
                          data-index={itemIndex}
                          onClick={() => handleSelect(dist.name, 'district')}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-900 text-white font-bold'
                              : isHighlighted
                              ? 'bg-blue-50 text-blue-950 font-medium'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-700'}`} />
                            <span className="truncate">{dist.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-slate-800/20 text-white' : 'bg-slate-800/80 text-slate-600'
                            }`}>
                              District
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Cities & Towns Section */}
                {cities.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Cities &amp; Towns ({cities.length})</span>
                      <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        Urban / Local
                      </span>
                    </div>
                    {cities.map(city => {
                      const itemIndex = flatOptions.findIndex(
                        o => o.value === city.name && o.type === 'city'
                      );
                      const isSelected = value === city.name;
                      const isHighlighted = highlightedIndex === itemIndex;

                      return (
                        <button
                          key={`city-${city.id}`}
                          type="button"
                          data-index={itemIndex}
                          onClick={() => handleSelect(city.name, 'city')}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-900 text-white font-bold'
                              : isHighlighted
                              ? 'bg-blue-50 text-blue-950 font-medium'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{city.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-slate-800/20 text-white' : 'bg-slate-800/80 text-slate-600'
                            }`}>
                              City
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {districts.length === 0 && cities.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No location found in {selectedState} matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
