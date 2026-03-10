'use client';

import { Search } from 'lucide-react';
import type { Filters, TimeFilter, ProbabilityFilter } from '@/types/market';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  resultCount: number;
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
            className={`px-3 py-1.5 text-[13px] transition-colors border-r border-terminal-border last:border-r-0 ${
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
}: FilterBarProps) {
  return (
    <div className="bg-terminal-panel/50 dark:bg-[#111]/50 border-b border-terminal-border px-5 py-1.5 flex items-center gap-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-muted" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="bg-terminal-bg dark:bg-black border border-terminal-border rounded-lg px-2.5 pl-8 py-1.5 text-[13px] text-terminal-text dark:text-gray-200 placeholder:text-terminal-dim dark:placeholder:text-gray-500 focus:border-terminal-muted focus:outline-none w-44 transition-colors"
        />
      </div>

      <div className="h-6 w-px bg-terminal-border" />

      {/* Probability Filter */}
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider font-medium">Prob</span>
        <ToggleGroup
          options={PROB_OPTIONS}
          value={filters.probabilityFilter}
          onChange={(v) => onFiltersChange({ probabilityFilter: v as ProbabilityFilter })}
          activeColor="bg-signal-green/10 text-signal-green"
        />
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider font-medium">Time</span>
        <ToggleGroup
          options={TIME_OPTIONS}
          value={filters.timeFilter}
          onChange={(v) => onFiltersChange({ timeFilter: v as TimeFilter })}
          activeColor="bg-signal-blue/10 text-signal-blue"
        />
      </div>

      {/* Liquidity */}
      <select
        value={filters.minLiquidity}
        onChange={(e) => onFiltersChange({ minLiquidity: Number(e.target.value) })}
        className="bg-terminal-bg dark:bg-black border border-terminal-border rounded-lg px-2 py-1.5 text-[13px] text-terminal-text dark:text-gray-200 focus:border-terminal-muted focus:outline-none cursor-pointer"
      >
        <option value={0}>Any liq</option>
        <option value={1000}>$1K+</option>
        <option value={10000}>$10K+</option>
        <option value={100000}>$100K+</option>
        <option value={1000000}>$1M+</option>
      </select>

      <div className="ml-auto text-[13px] text-terminal-muted dark:text-gray-400 tabular-nums">
        {resultCount} results
      </div>
    </div>
  );
}
