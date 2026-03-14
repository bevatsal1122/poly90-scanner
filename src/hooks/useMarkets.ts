'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Market, Filters, ScannerStats } from '@/types/market';

const POLL_INTERVAL = 6000;
const MAX_HISTORY_POINTS = 30;

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

export function useMarkets(filters: Filters, favorites: Set<string>) {
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const priceHistoryRef = useRef<Map<string, number[]>>(new Map());
  const priceChangesRef = useRef<Map<string, number>>(new Map());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/markets', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      const markets: Market[] = data.markets;
      const prevPrices = prevPricesRef.current;
      const history = priceHistoryRef.current;
      const changes = priceChangesRef.current;

      for (const m of markets) {
        // Price change
        const prev = prevPrices.get(m.id);
        if (prev !== undefined) {
          changes.set(m.id, m.bestPrice - prev);
        }
        prevPrices.set(m.id, m.bestPrice);

        // Price history
        const h = history.get(m.id) || [];
        h.push(m.bestPrice);
        if (h.length > MAX_HISTORY_POINTS) h.shift();
        history.set(m.id, h);
      }

      setAllMarkets(markets);
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

  // Enrich markets with price data
  const enrichedMarkets = allMarkets.map((m) => ({
    ...m,
    priceChange: priceChangesRef.current.get(m.id) || 0,
    priceHistory: priceHistoryRef.current.get(m.id) || [m.bestPrice],
  }));

  // Apply filters
  const filteredMarkets = enrichedMarkets.filter((market) => {
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

    // Tag filter
    if (filters.tag) {
      if (filters.tag === '__watchlist__') {
        if (!favorites.has(market.id)) return false;
      } else {
        const keywords = filters.tag.toLowerCase().split(/\s+/);
        const haystack =
          `${market.question} ${market.bestOutcome} ${market.category} ${market.description || ''}`.toLowerCase();
        if (!keywords.some((kw) => haystack.includes(kw))) return false;
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
    resolvingSoon: allMarkets.filter((m) => m.timeRemaining <= 60 * 60 * 1000)
      .length,
  };

  return {
    markets: sortedMarkets,
    allMarkets: enrichedMarkets,
    loading,
    error,
    lastUpdated,
    stats,
    refetch: fetchData,
  };
}
