'use client';

import { Activity, RefreshCw, Sun, Moon } from 'lucide-react';
import type { ScannerStats } from '@/types/market';
import type { Theme } from '@/hooks/useTheme';

interface HeaderProps {
  lastUpdated: number;
  onRefresh: () => void;
  loading: boolean;
  stats: ScannerStats;
  theme: Theme;
  onToggleTheme: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function Header({ lastUpdated, onRefresh, loading, stats, theme, onToggleTheme }: HeaderProps) {
  const lastUpdateStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : '--:--:--';

  return (
    <header className="h-11 bg-terminal-panel dark:bg-[#111] border-b border-terminal-border flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-signal-green" />
          <span className="text-[16px] font-semibold text-terminal-text dark:text-white tracking-wide">
            POLY90 SCANNER
          </span>
        </div>

        <div className="h-5 w-px bg-terminal-border" />

        <div className="flex items-center gap-5 text-[13px]">
          <span>
            <span className="text-terminal-muted dark:text-gray-400 mr-1.5">Markets</span>
            <span className="text-terminal-text dark:text-gray-200 font-medium tabular-nums">{stats.totalMarkets}</span>
          </span>
          <span>
            <span className="text-terminal-muted dark:text-gray-400 mr-1.5">95%+</span>
            <span className="text-terminal-text dark:text-gray-200 font-medium tabular-nums">{stats.highProbMarkets}</span>
          </span>
          <span>
            <span className="text-terminal-muted dark:text-gray-400 mr-1.5">Liq</span>
            <span className="text-terminal-text dark:text-gray-200 font-medium tabular-nums">{formatNumber(stats.totalLiquidity)}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[13px] text-terminal-muted dark:text-gray-400">
          <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse-green" />
          LIVE
        </div>
        <span className="text-[13px] text-terminal-muted dark:text-gray-400 tabular-nums">
          {lastUpdateStr}
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-terminal-muted dark:text-gray-400 hover:text-terminal-text dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-terminal-bg dark:bg-white/10 border border-terminal-border hover:bg-terminal-border/40 dark:hover:bg-white/20 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-terminal-muted" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-400" />
          )}
        </button>
      </div>
    </header>
  );
}
