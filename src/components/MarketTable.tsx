'use client';

import { useState, useEffect } from 'react';
import {
  ExternalLink,
  Clock,
  Droplets,
  TrendingUp,
  BarChart3,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { Market, SortField, SortDirection } from '@/types/market';

interface MarketTableProps {
  markets: Market[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectMarket: (market: Market) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function getProbColor(prob: number): string {
  if (prob >= 0.98) return 'text-emerald-600 dark:text-emerald-400';
  if (prob >= 0.95) return 'text-emerald-500 dark:text-emerald-400';
  if (prob >= 0.92) return 'text-cyan-600 dark:text-cyan-400';
  return 'text-blue-600 dark:text-blue-400';
}

function getProbBg(prob: number): string {
  if (prob >= 0.98) return 'bg-emerald-500';
  if (prob >= 0.95) return 'bg-emerald-400';
  if (prob >= 0.92) return 'bg-cyan-500';
  return 'bg-blue-500';
}

function getTimeColor(ms: number): string {
  if (ms <= 10 * 60 * 1000) return 'text-red-600 dark:text-red-400';
  if (ms <= 60 * 60 * 1000) return 'text-amber-600 dark:text-amber-400';
  return 'text-terminal-muted dark:text-gray-400';
}

function formatTime(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return '--';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default function MarketTable({
  markets,
  onSelectMarket,
  favorites,
  onToggleFavorite,
}: MarketTableProps) {
  // Live countdown — ticks every second
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (markets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-terminal-muted text-base">
            No markets match current filters
          </p>
          <p className="text-terminal-dim text-sm mt-1">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {markets.map((market) => {
          const isFav = favorites.has(market.id);
          const liveRemaining = market.endDate
            ? Math.max(0, new Date(market.endDate).getTime() - now)
            : Infinity;
          const liveLabel = formatTime(liveRemaining);
          const priceChange = market.priceChange || 0;

          return (
            <div
              key={market.id}
              onClick={() => onSelectMarket(market)}
              className="bg-terminal-panel dark:bg-[#111] border border-terminal-border px-5 py-4 cursor-pointer hover:bg-terminal-bg/60 dark:hover:bg-white/5 transition-all"
            >
              {/* Top: Image + Question + Star + Link */}
              <div className="flex items-start gap-2.5 mb-3">
                {market.image ? (
                  <img
                    src={market.image}
                    alt=""
                    className="w-8 h-8 rounded-md object-cover shrink-0 mt-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-signal-green/10 dark:bg-signal-green/5 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-signal-green uppercase">
                      {market.category?.[0] || '?'}
                    </span>
                  </div>
                )}
                <h3 className="text-[15px] font-medium text-terminal-text dark:text-white leading-snug line-clamp-2 flex-1">
                  {market.question}
                </h3>
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(market.id);
                    }}
                    className={`p-0.5 transition-colors cursor-pointer ${
                      isFav
                        ? 'text-yellow-500'
                        : 'text-terminal-dim dark:text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={isFav ? 'currentColor' : 'none'}
                    />
                  </button>
                  <a
                    href={market.polymarketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-terminal-muted dark:text-gray-500 hover:text-signal-green transition-colors p-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Probability split bar */}
              <div className="my-4">
                <div className="flex items-end gap-0.5 mb-2">
                  <span className={`text-[15px] font-bold tabular-nums leading-none ${getProbColor(market.bestPrice)}`}>
                    {market.bestOutcome} {(market.bestPrice * 100).toFixed(1)}%
                  </span>
                  {priceChange !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 text-[11px] font-medium tabular-nums leading-none ml-1 ${
                        priceChange > 0
                          ? 'text-signal-green'
                          : 'text-signal-red'
                      }`}
                    >
                      {priceChange > 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      {Math.abs(priceChange * 100).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-signal-red/70 tabular-nums leading-none ml-auto">
                    {((1 - market.bestPrice) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex w-full h-2.5">
                  <div
                    className={`h-full transition-all duration-500 ${getProbBg(market.bestPrice)}`}
                    style={{ width: `${market.bestPrice * 100}%` }}
                  />
                  <div
                    className="h-full bg-signal-red/40 flex-1"
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-0 border border-terminal-border rounded-lg overflow-hidden">
                <div className="flex flex-col items-center py-1.5 px-1 bg-terminal-bg/50 dark:bg-white/5">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[12px] text-terminal-muted dark:text-gray-400">
                      Yield
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{market.expectedReturn.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col items-center py-1.5 px-1 border-x border-terminal-border bg-terminal-bg/50 dark:bg-white/5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[12px] text-terminal-muted dark:text-gray-400">
                      Time
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${getTimeColor(liveRemaining)}`}
                  >
                    {liveLabel}
                  </span>
                </div>
                <div className="flex flex-col items-center py-1.5 px-1 border-r border-terminal-border bg-terminal-bg/50 dark:bg-white/5">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[12px] text-terminal-muted dark:text-gray-400">
                      Liq
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-terminal-text dark:text-gray-200 tabular-nums">
                    {formatCompact(market.liquidity)}
                  </span>
                </div>
                <div className="flex flex-col items-center py-1.5 px-1 bg-terminal-bg/50 dark:bg-white/5">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[12px] text-terminal-muted dark:text-gray-400">
                      Vol
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-terminal-text dark:text-gray-200 tabular-nums">
                    {formatCompact(market.volume)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
