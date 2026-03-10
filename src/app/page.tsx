'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import MarketTable from '@/components/MarketTable';
import MarketDetail from '@/components/MarketDetail';
import { useMarkets } from '@/hooks/useMarkets';
import { useTheme } from '@/hooks/useTheme';
import type { Filters, Market, SortField } from '@/types/market';

const DEFAULT_FILTERS: Filters = {
  category: 'all',
  timeFilter: 'all',
  probabilityFilter: 'all',
  minLiquidity: 0,
  sortField: 'probability',
  sortDirection: 'desc',
  search: '',
};

export default function ScannerPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const { theme, toggleTheme } = useTheme();

  const { markets, allMarkets, categories, loading, lastUpdated, stats, refetch } =
    useMarkets(filters);

  const marketCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of allMarkets) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }
    return counts;
  }, [allMarkets]);

  const updateFilters = (partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleSort = (field: SortField) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortDirection:
        prev.sortField === field && prev.sortDirection === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-terminal-bg dark:bg-black overflow-hidden">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        loading={loading}
        stats={stats}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <FilterBar
        filters={filters}
        onFiltersChange={updateFilters}
        resultCount={markets.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          categories={categories}
          selected={filters.category}
          onSelect={(category) => updateFilters({ category })}
          marketCounts={marketCounts}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {loading && allMarkets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-5 h-5 border-2 border-signal-green/30 border-t-signal-green rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[12px] text-terminal-muted">Scanning markets...</p>
              </div>
            </div>
          ) : (
            <MarketTable
              markets={markets}
              sortField={filters.sortField}
              sortDirection={filters.sortDirection}
              onSort={handleSort}
              onSelectMarket={setSelectedMarket}
            />
          )}
        </main>
      </div>

      {selectedMarket && (
        <MarketDetail
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
        />
      )}
    </div>
  );
}
