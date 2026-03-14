'use client';

import {
  TrendingUp,
  Zap,
  Sparkles,
  Landmark,
  Trophy,
  Bitcoin,
  Globe,
  DollarSign,
  Cpu,
  Palette,
  CloudSun,
  AtSign,
  Vote,
  Layers,
  Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface CategoryItem {
  label: string;
  value: string;
  icon: ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { label: 'Trending', value: '', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Watchlist', value: '__watchlist__', icon: <Star className="w-4 h-4" /> },
  { label: 'Breaking', value: 'breaking', icon: <Zap className="w-4 h-4" /> },
  { label: 'New', value: 'new', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Politics', value: 'trump biden president congress senate republican democrat governor minister parliament', icon: <Landmark className="w-4 h-4" /> },
  { label: 'Sports', value: 'nfl nba mlb nhl soccer football basketball baseball hockey tennis golf ufc boxing world series super bowl champion league premier', icon: <Trophy className="w-4 h-4" /> },
  { label: 'Crypto', value: 'bitcoin ethereum btc eth solana crypto blockchain token defi nft coinbase binance xrp dogecoin cardano polygon', icon: <Bitcoin className="w-4 h-4" /> },
  { label: 'Iran', value: 'iran iranian tehran', icon: <Globe className="w-4 h-4" /> },
  { label: 'Finance', value: 'fed federal reserve interest rate stock market s&p nasdaq dow treasury bond yield inflation cpi', icon: <DollarSign className="w-4 h-4" /> },
  { label: 'Geopolitics', value: 'war nato ukraine russia china taiwan korea sanctions military invasion treaty', icon: <Globe className="w-4 h-4" /> },
  { label: 'Tech', value: 'ai artificial intelligence openai google apple microsoft meta amazon tesla spacex nvidia', icon: <Cpu className="w-4 h-4" /> },
  { label: 'Culture', value: 'oscar grammy emmy movie film album celebrity tiktok youtube twitter', icon: <Palette className="w-4 h-4" /> },
  { label: 'Economy', value: 'gdp recession unemployment jobs economy economic inflation growth debt deficit', icon: <Layers className="w-4 h-4" /> },
  { label: 'Weather & Science', value: 'weather hurricane earthquake climate nasa space asteroid temperature wildfire flood', icon: <CloudSun className="w-4 h-4" /> },
  { label: 'Mentions', value: 'mentions', icon: <AtSign className="w-4 h-4" /> },
  { label: 'Elections', value: 'election vote ballot primary caucus midterm governor mayor referendum poll', icon: <Vote className="w-4 h-4" /> },
];

interface SidebarProps {
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  favorites: Set<string>;
}

export default function Sidebar({
  selectedTag,
  onSelectTag,
  favorites,
}: SidebarProps) {
  return (
    <aside className="w-48 bg-terminal-panel dark:bg-[#111] border-r border-terminal-border shrink-0 flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto py-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedTag === cat.value;
          const isWatchlist = cat.value === '__watchlist__';
          return (
            <button
              key={cat.value + cat.label}
              onClick={() => onSelectTag(isActive ? '' : cat.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors cursor-pointer ${
                isActive
                  ? 'text-signal-green bg-signal-green/5 border-r-2 border-signal-green'
                  : 'text-terminal-muted dark:text-gray-400 hover:text-terminal-text dark:hover:text-white hover:bg-terminal-border/15 dark:hover:bg-white/5'
              }`}
            >
              {cat.icon}
              <span className="flex-1 text-left truncate">{cat.label}</span>
              {isWatchlist && favorites.size > 0 && (
                <span
                  className={`text-[11px] tabular-nums ${
                    isActive ? 'text-signal-green/70' : 'text-terminal-dim dark:text-gray-500'
                  }`}
                >
                  {favorites.size}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
