'use client';

import { ExternalLink, Clock, Droplets, TrendingUp } from 'lucide-react';
import type { Market, SortField, SortDirection } from '@/types/market';

interface MarketTableProps {
  markets: Market[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectMarket: (market: Market) => void;
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

export default function MarketTable({
  markets,
  onSelectMarket,
}: MarketTableProps) {
  if (markets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-terminal-muted text-base">No markets match current filters</p>
          <p className="text-terminal-dim text-sm mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => (
          <div
            key={market.id}
            onClick={() => onSelectMarket(market)}
            className="bg-terminal-panel dark:bg-[#111] border border-terminal-border px-5 pt-4 pb-2.5 cursor-pointer hover:bg-terminal-bg/60 dark:hover:bg-white/5 transition-all"
          >
            {/* Top: Question + Link */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-[15px] font-medium text-terminal-text dark:text-white leading-snug line-clamp-2 flex-1">
                {market.question}
              </h3>
              <a
                href={market.polymarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-terminal-muted dark:text-gray-500 hover:text-signal-green transition-colors shrink-0 mt-0.5"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Outcome badge */}
            <div className="mb-2">
              <span className="inline-block text-[13px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                {market.bestOutcome}
              </span>
            </div>

            {/* Probability bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-terminal-muted dark:text-gray-400 font-medium">Probability</span>
                <span className={`text-lg font-bold tabular-nums ${getProbColor(market.bestPrice)}`}>
                  {(market.bestPrice * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-terminal-border/40 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProbBg(market.bestPrice)}`}
                  style={{ width: `${Math.min(100, market.bestPrice * 100)}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-0 border border-terminal-border rounded-lg overflow-hidden">
              <div className="flex flex-col items-center py-1.5 px-1 bg-terminal-bg/50 dark:bg-white/5">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[12px] text-terminal-muted dark:text-gray-400">Yield</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{market.expectedReturn.toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center py-1.5 px-1 border-x border-terminal-border bg-terminal-bg/50 dark:bg-white/5">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[12px] text-terminal-muted dark:text-gray-400">Time</span>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${getTimeColor(market.timeRemaining)}`}>
                  {market.timeRemainingLabel}
                </span>
              </div>
              <div className="flex flex-col items-center py-1.5 px-1 bg-terminal-bg/50 dark:bg-white/5">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[12px] text-terminal-muted dark:text-gray-400">Liq</span>
                </div>
                <span className="text-sm font-semibold text-terminal-text dark:text-gray-200 tabular-nums">
                  {formatCompact(market.liquidity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
