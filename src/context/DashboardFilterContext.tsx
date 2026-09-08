import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardGlobalFilters } from '../types';

interface DashboardFilterContextType {
  filters: DashboardGlobalFilters;
  updateFilter: (patch: Partial<DashboardGlobalFilters>) => void;
  resetFilters: () => void;
  setFiltersDirectly: React.Dispatch<React.SetStateAction<DashboardGlobalFilters>>;
}

const defaultFilters: DashboardGlobalFilters = {
  state: '',
  district: '',
  constituency: '',
  house: 'All',
  mpId: '',
  projectStatus: 'All',
  workType: 'All',
  riskLevel: 'ALL',
  financialYear: '2024-25',
  searchQuery: '',
  visualization: 'map',
};

const DashboardFilterContext = createContext<DashboardFilterContextType | undefined>(undefined);

export const DashboardFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<DashboardGlobalFilters>(() => {
    // Check if initial filters can be recovered from sessionStorage
    try {
      const saved = sessionStorage.getItem('mplads_active_filters');
      if (saved) {
        return { ...defaultFilters, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return defaultFilters;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('mplads_active_filters', JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters]);

  const updateFilter = (patch: Partial<DashboardGlobalFilters>) => {
    setFilters(prev => {
      const next = { ...prev, ...patch };
      // Cascading reset logic
      if (patch.state !== undefined && patch.state !== prev.state) {
        next.district = '';
        next.constituency = '';
        next.mpId = '';
      }
      if (patch.district !== undefined && patch.district !== prev.district) {
        next.constituency = '';
        next.mpId = '';
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <DashboardFilterContext.Provider
      value={{
        filters,
        updateFilter,
        resetFilters,
        setFiltersDirectly: setFilters,
      }}
    >
      {children}
    </DashboardFilterContext.Provider>
  );
};

export function useDashboardFilter(): DashboardFilterContextType {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error('useDashboardFilter must be used within a DashboardFilterProvider');
  }
  return context;
}
