'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Market, Filters, ScannerStats } from '@/types/market';

const POLL_INTERVAL = 10000;

const TIME_FILTER_MS: Record<string, number> = {
  '10m': 10 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

const PROB_RANGES: Record<string, [number, number]> = {
  '90-92': [0.90, 0.92],
  '92-95': [0.92, 0.95],
  '95-98': [0.95, 0.98],
  '98-100': [0.98, 1.0],
};

export function useMarkets(filters: Filters) {
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/markets', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAllMarkets(data.markets);
      setCategories(data.categories);
      setLastUpdated(data.timestamp);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  // Apply filters
  const filteredMarkets = allMarkets.filter((market) => {
    // Category filter
    if (filters.category !== 'all' && market.category !== filters.category) {
      return false;
    }

    // Time filter
    if (filters.timeFilter !== 'all') {
      const maxMs = TIME_FILTER_MS[filters.timeFilter];
      if (maxMs && market.timeRemaining > maxMs) return false;
    }

    // Probability filter
    if (filters.probabilityFilter !== 'all') {
      const range = PROB_RANGES[filters.probabilityFilter];
      if (range) {
        const [min, max] = range;
        if (market.bestPrice < min || market.bestPrice > max) return false;
      }
    }

    // Liquidity filter
    if (market.liquidity < filters.minLiquidity) return false;

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !market.question.toLowerCase().includes(q) &&
        !market.bestOutcome.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    const dir = filters.sortDirection === 'asc' ? 1 : -1;
    switch (filters.sortField) {
      case 'probability':
        return (a.bestPrice - b.bestPrice) * dir;
      case 'timeRemaining':
        return (a.timeRemaining - b.timeRemaining) * dir;
      case 'liquidity':
        return (a.liquidity - b.liquidity) * dir;
      case 'volume':
        return (a.volume - b.volume) * dir;
      case 'expectedReturn':
        return (a.expectedReturn - b.expectedReturn) * dir;
      default:
        return 0;
    }
  });

  // Stats
  const stats: ScannerStats = {
    totalMarkets: allMarkets.length,
    highProbMarkets: allMarkets.filter((m) => m.bestPrice >= 0.95).length,
    avgProbability:
      allMarkets.length > 0
        ? allMarkets.reduce((sum, m) => sum + m.bestPrice, 0) / allMarkets.length
        : 0,
    totalLiquidity: allMarkets.reduce((sum, m) => sum + m.liquidity, 0),
    resolvingSoon: allMarkets.filter(
      (m) => m.timeRemaining <= 60 * 60 * 1000
    ).length,
  };

  return {
    markets: sortedMarkets,
    allMarkets,
    categories,
    loading,
    error,
    lastUpdated,
    stats,
    refetch: fetchData,
  };
}
