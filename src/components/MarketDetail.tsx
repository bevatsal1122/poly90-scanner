'use client';

import { X, ExternalLink, Clock, Droplets, BarChart3, TrendingUp } from 'lucide-react';
import type { Market } from '@/types/market';

interface MarketDetailProps {
  market: Market;
  onClose: () => void;
}

function formatLiquidity(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function MarketDetail({ market, onClose }: MarketDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-terminal-panel dark:bg-[#111] border border-terminal-border rounded-xl shadow-xl w-full max-w-2xl mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-terminal-border">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-border/50 text-terminal-muted dark:text-gray-400 uppercase tracking-wider">
                {market.category}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-terminal-text dark:text-white leading-snug">
              {market.question}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-terminal-muted dark:text-gray-400 hover:text-terminal-text dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-px bg-terminal-border/30 border-b border-terminal-border">
          <div className="bg-terminal-panel dark:bg-[#111] px-4 py-3">
            <div className="text-[10px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider mb-1">
              Predicted Outcome
            </div>
            <div className="text-lg font-bold text-signal-green">
              {market.bestOutcome}
            </div>
          </div>
          <div className="bg-terminal-panel dark:bg-[#111] px-4 py-3">
            <div className="text-[10px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider mb-1">
              Probability
            </div>
            <div className="text-lg font-bold text-signal-green tabular-nums">
              {(market.bestPrice * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-terminal-panel dark:bg-[#111] px-4 py-3">
            <div className="text-[10px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider mb-1">
              Est. Yield
            </div>
            <div className="text-lg font-bold text-signal-cyan tabular-nums">
              +{market.expectedReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-terminal-panel dark:bg-[#111] px-4 py-3">
            <div className="text-[10px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider mb-1">
              Time Remaining
            </div>
            <div className="text-lg font-bold text-signal-yellow tabular-nums">
              {market.timeRemainingLabel}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-4">
          {/* Outcomes */}
          <div>
            <div className="text-[10px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider mb-2">
              All Outcomes
            </div>
            <div className="space-y-2">
              {market.outcomes.map((outcome) => (
                <div
                  key={outcome.name}
                  className="flex items-center justify-between bg-terminal-bg dark:bg-white/5 rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-terminal-text dark:text-gray-200">{outcome.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-terminal-border/30 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          outcome.price === market.bestPrice
                            ? 'bg-signal-green/60'
                            : 'bg-signal-red/40'
                        }`}
                        style={{ width: `${outcome.price * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums w-14 text-right ${
                        outcome.price === market.bestPrice
                          ? 'text-signal-green'
                          : 'text-signal-red'
                      }`}
                    >
                      {(outcome.price * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 bg-terminal-bg dark:bg-white/5 rounded-lg px-3 py-2">
              <Droplets className="w-3.5 h-3.5 text-signal-blue" />
              <div>
                <div className="text-[10px] text-terminal-muted dark:text-gray-400">Liquidity</div>
                <div className="text-xs text-terminal-text dark:text-gray-200 tabular-nums">
                  {formatLiquidity(market.liquidity)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-terminal-bg dark:bg-white/5 rounded-lg px-3 py-2">
              <BarChart3 className="w-3.5 h-3.5 text-signal-cyan" />
              <div>
                <div className="text-[10px] text-terminal-muted dark:text-gray-400">Volume</div>
                <div className="text-xs text-terminal-text dark:text-gray-200 tabular-nums">
                  {formatLiquidity(market.volume)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-terminal-bg dark:bg-white/5 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-signal-yellow" />
              <div>
                <div className="text-[10px] text-terminal-muted dark:text-gray-400">End Date</div>
                <div className="text-xs text-terminal-text dark:text-gray-200">
                  {market.endDate
                    ? new Date(market.endDate).toLocaleDateString()
                    : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {market.description && (
            <div>
              <div className="text-[10px] text-terminal-muted dark:text-gray-400 uppercase tracking-wider mb-1">
                Description
              </div>
              <p className="text-xs text-terminal-muted dark:text-gray-300 leading-relaxed line-clamp-4">
                {market.description}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="px-5 py-3 border-t border-terminal-border">
          <a
            href={market.polymarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-signal-green/10 hover:bg-signal-green/20 border border-signal-green/30 text-signal-green rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Trade on Polymarket
          </a>
        </div>
      </div>
    </div>
  );
}
