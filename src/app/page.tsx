'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import MarketTable from '@/components/MarketTable';
import MarketDetail from '@/components/MarketDetail';
import SkeletonCard from '@/components/SkeletonCard';
import { useMarkets } from '@/hooks/useMarkets';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/hooks/useFavorites';
import {
  sendNotification,
  playNotificationSound,
  requestNotificationPermission,
} from '@/lib/notifications';
import { exportMarketsToCSV } from '@/lib/csv';
import type {
  Filters,
  Market,
  SortField,
  TimeFilter,
  ProbabilityFilter,
} from '@/types/market';

const DEFAULT_FILTERS: Filters = {
  tag: '',
  timeFilter: 'all',
  probabilityFilter: 'all',
  minLiquidity: 0,
  sortField: 'probability',
  sortDirection: 'desc',
  search: '',
};

function readFiltersFromURL(): Partial<Filters> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const f: Partial<Filters> = {};
  if (params.get('tag')) f.tag = params.get('tag')!;
  if (params.get('time')) f.timeFilter = params.get('time') as TimeFilter;
  if (params.get('prob'))
    f.probabilityFilter = params.get('prob') as ProbabilityFilter;
  if (params.get('liq')) f.minLiquidity = Number(params.get('liq'));
  if (params.get('q')) f.search = params.get('q')!;
  if (params.get('sort')) f.sortField = params.get('sort') as SortField;
  if (params.get('dir'))
    f.sortDirection = params.get('dir') as 'asc' | 'desc';
  return f;
}

function syncFiltersToURL(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.timeFilter !== 'all') params.set('time', filters.timeFilter);
  if (filters.probabilityFilter !== 'all')
    params.set('prob', filters.probabilityFilter);
  if (filters.minLiquidity > 0)
    params.set('liq', String(filters.minLiquidity));
  if (filters.search) params.set('q', filters.search);
  if (filters.sortField !== 'probability')
    params.set('sort', filters.sortField);
  if (filters.sortDirection !== 'desc')
    params.set('dir', filters.sortDirection);
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

export default function ScannerPage() {
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    ...readFiltersFromURL(),
  }));
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();
  const notifiedRef = useRef<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { markets, allMarkets, loading, lastUpdated, stats, refetch } =
    useMarkets(filters, favorites);

  // Sync filters to URL
  useEffect(() => {
    syncFiltersToURL(filters);
  }, [filters]);

  // Load notification preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('poly90-notifications');
      if (stored === 'true') setNotificationsEnabled(true);
    } catch {
      /* empty */
    }
  }, []);

  // Notifications — watch for significant price changes and soon-resolving markets
  useEffect(() => {
    if (!notificationsEnabled) return;
    for (const m of allMarkets) {
      // Favorited market with significant price change
      if (
        favorites.has(m.id) &&
        m.priceChange &&
        Math.abs(m.priceChange) > 0.02
      ) {
        const key = `price-${m.id}-${m.bestPrice.toFixed(3)}`;
        if (!notifiedRef.current.has(key)) {
          const dir = m.priceChange > 0 ? 'up' : 'down';
          sendNotification(
            `Price ${dir}: ${m.question.slice(0, 50)}`,
            `${(m.bestPrice * 100).toFixed(1)}% (${m.priceChange > 0 ? '+' : ''}${(m.priceChange * 100).toFixed(1)}%)`
          );
          playNotificationSound();
          notifiedRef.current.add(key);
        }
      }

      // Market resolving very soon
      if (m.timeRemaining <= 10 * 60 * 1000 && m.timeRemaining > 0) {
        const key = `resolve-${m.id}`;
        if (!notifiedRef.current.has(key)) {
          sendNotification(
            'Resolving soon!',
            `${m.question.slice(0, 60)} — ${m.timeRemainingLabel} left`
          );
          notifiedRef.current.add(key);
        }
      }
    }
  }, [allMarkets, notificationsEnabled, favorites]);

  const handleToggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('poly90-notifications', 'true');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('poly90-notifications', 'false');
    }
  }, [notificationsEnabled]);

  const updateFilters = useCallback((partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortDirection:
        prev.sortField === field && prev.sortDirection === 'desc'
          ? 'asc'
          : 'desc',
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape to close modal
      if (e.key === 'Escape') {
        if (selectedMarket) {
          setSelectedMarket(null);
          return;
        }
        if (sidebarOpen) {
          setSidebarOpen(false);
          return;
        }
      }
      // / to focus search (when not in an input)
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMarket, sidebarOpen]);

  return (
    <div className="h-screen flex flex-col bg-terminal-bg dark:bg-black overflow-hidden">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        loading={loading}
        stats={stats}
        theme={theme}
        onToggleTheme={toggleTheme}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />
      <FilterBar
        filters={filters}
        onFiltersChange={updateFilters}
        resultCount={markets.length}
        onSort={handleSort}
        onExport={() => exportMarketsToCSV(markets)}
        searchInputRef={searchInputRef}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            absolute lg:static top-0 bottom-0 left-0 z-50 lg:z-auto
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          `}
        >
          <Sidebar
            selectedTag={filters.tag}
            onSelectTag={(tag) => {
              updateFilters({ tag });
              setSidebarOpen(false);
            }}
            favorites={favorites}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          {loading && allMarkets.length === 0 ? (
            <div className="flex-1 overflow-auto">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : (
            <MarketTable
              markets={markets}
              sortField={filters.sortField}
              sortDirection={filters.sortDirection}
              onSort={handleSort}
              onSelectMarket={setSelectedMarket}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>

      {selectedMarket && (
        <MarketDetail
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
          isFavorite={isFavorite(selectedMarket.id)}
          onToggleFavorite={() => toggleFavorite(selectedMarket.id)}
        />
      )}
    </div>
  );
}
