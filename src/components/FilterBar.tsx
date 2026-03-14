'use client';

import { useState, useEffect, type RefObject } from 'react';
import { Search, Download, ArrowUpDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { Filters, TimeFilter, ProbabilityFilter, SortField } from '@/types/market';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  resultCount: number;
  onSort: (field: SortField) => void;
  onExport: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

const TIME_OPTIONS: { label: string; value: TimeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: '10m', value: '10m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
];

const PROB_OPTIONS: { label: string; value: ProbabilityFilter }[] = [
  { label: '90%+', value: 'all' },
  { label: '90-92', value: '90-92' },
  { label: '92-95', value: '92-95' },
  { label: '95-98', value: '95-98' },
  { label: '98+', value: '98-100' },
];

const SORT_OPTIONS: { label: string; field: SortField; dir: 'asc' | 'desc' }[] = [
  { label: 'Prob \u2193', field: 'probability', dir: 'desc' },
  { label: 'Prob \u2191', field: 'probability', dir: 'asc' },
  { label: 'Time \u2191', field: 'timeRemaining', dir: 'asc' },
  { label: 'Time \u2193', field: 'timeRemaining', dir: 'desc' },
  { label: 'Liq \u2193', field: 'liquidity', dir: 'desc' },
  { label: 'Volume \u2193', field: 'volume', dir: 'desc' },
  { label: 'Yield \u2193', field: 'expectedReturn', dir: 'desc' },
];

function ToggleGroup({
  options,
  value,
  onChange,
  activeColor,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  activeColor: string;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-terminal-border">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-[13px] transition-colors cursor-pointer border-r border-terminal-border last:border-r-0 ${
              isActive
                ? `${activeColor} font-medium`
                : 'text-terminal-muted dark:text-gray-400 hover:text-terminal-text dark:hover:text-white hover:bg-terminal-border/20 dark:hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterBar({
  filters,
  onFiltersChange,
  resultCount,
  onSort,
  onExport,
  searchInputRef,
}: FilterBarProps) {
  // Debounced search — local state for responsive input, debounced propagation
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFiltersChange]);

  // Sync external changes (e.g. URL sync)
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const currentSortKey = `${filters.sortField}-${filters.sortDirection}`;

  return (
    <div className="bg-terminal-panel/50 dark:bg-[#111]/50 border-b border-terminal-border px-4 lg:px-5 py-1.5 flex items-center gap-3 lg:gap-5 overflow-x-auto scrollbar-hide">
      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-muted" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search... (/)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-terminal-bg dark:bg-black border border-terminal-border rounded-lg px-2.5 pl-8 py-1.5 text-[13px] text-terminal-text dark:text-gray-200 placeholder:text-terminal-dim dark:placeholder:text-gray-500 focus:border-terminal-muted focus:outline-none w-40 lg:w-44 transition-colors"
        />
      </div>

      <div className="h-6 w-px bg-terminal-border shrink-0 hidden md:block" />

      {/* Probability Filter */}
      <div className="hidden md:flex items-center gap-2.5 shrink-0">
        <span className="text-[12px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider font-medium">
          Prob
        </span>
        <ToggleGroup
          options={PROB_OPTIONS}
          value={filters.probabilityFilter}
          onChange={(v) =>
            onFiltersChange({ probabilityFilter: v as ProbabilityFilter })
          }
          activeColor="bg-signal-green/10 text-signal-green"
        />
      </div>

      {/* Time Filter */}
      <div className="hidden lg:flex items-center gap-2.5 shrink-0">
        <span className="text-[12px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider font-medium">
          Time
        </span>
        <ToggleGroup
          options={TIME_OPTIONS}
          value={filters.timeFilter}
          onChange={(v) =>
            onFiltersChange({ timeFilter: v as TimeFilter })
          }
          activeColor="bg-signal-blue/10 text-signal-blue"
        />
      </div>

      {/* Liquidity */}
      <select
        value={filters.minLiquidity}
        onChange={(e) =>
          onFiltersChange({ minLiquidity: Number(e.target.value) })
        }
        className="bg-terminal-bg dark:bg-black border border-terminal-border rounded-lg px-3 py-1.5 text-[13px] text-terminal-text dark:text-gray-200 focus:border-terminal-muted focus:outline-none cursor-pointer min-w-[140px] shrink-0"
      >
        <option value={0}>Any liq</option>
        <option value={1000}>$1K+</option>
        <option value={10000}>$10K+</option>
        <option value={100000}>$100K+</option>
        <option value={1000000}>$1M+</option>
      </select>

      {/* Sort */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ArrowUpDown className="w-3.5 h-3.5 text-terminal-muted dark:text-gray-400" />
        <select
          value={currentSortKey}
          onChange={(e) => {
            const opt = SORT_OPTIONS.find(
              (o) => `${o.field}-${o.dir}` === e.target.value
            );
            if (opt) {
              onFiltersChange({
                sortField: opt.field,
                sortDirection: opt.dir,
              });
            }
          }}
          className="bg-terminal-bg dark:bg-black border border-terminal-border rounded-lg px-2 py-1.5 text-[13px] text-terminal-text dark:text-gray-200 focus:border-terminal-muted focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={`${opt.field}-${opt.dir}`} value={`${opt.field}-${opt.dir}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Export CSV */}
      <button
        onClick={onExport}
        className="p-1.5 text-terminal-muted dark:text-gray-400 hover:text-terminal-text dark:hover:text-white transition-colors cursor-pointer shrink-0"
        title="Export to CSV"
      >
        <Download className="w-4 h-4" />
      </button>

      <div className="ml-auto text-[13px] text-terminal-muted dark:text-gray-400 tabular-nums shrink-0">
        {resultCount} results
      </div>
    </div>
  );
}
