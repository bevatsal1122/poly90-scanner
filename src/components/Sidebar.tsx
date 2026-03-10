'use client';

import {
  Globe,
  Landmark,
  Trophy,
  Bitcoin,
  Cpu,
  TrendingUp,
  BarChart3,
  Layers,
} from 'lucide-react';
import type { ReactNode } from 'react';

const CATEGORY_ICONS: Record<string, ReactNode> = {
  all: <Layers className="w-4 h-4" />,
  crypto: <Bitcoin className="w-4 h-4" />,
  politics: <Landmark className="w-4 h-4" />,
  sports: <Trophy className="w-4 h-4" />,
  'pop culture': <Globe className="w-4 h-4" />,
  science: <Cpu className="w-4 h-4" />,
  economics: <TrendingUp className="w-4 h-4" />,
  business: <BarChart3 className="w-4 h-4" />,
};

interface SidebarProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  marketCounts: Record<string, number>;
}

export default function Sidebar({
  categories,
  selected,
  onSelect,
  marketCounts,
}: SidebarProps) {
  const allCategories = ['all', ...categories];

  return (
    <aside className="w-44 bg-terminal-panel dark:bg-[#111] border-r border-terminal-border shrink-0 flex flex-col">
      <nav className="flex-1 overflow-y-auto py-2">
        {allCategories.map((cat) => {
          const isActive = selected === cat;
          const count =
            cat === 'all'
              ? Object.values(marketCounts).reduce((a, b) => a + b, 0)
              : marketCounts[cat] || 0;
          const icon = CATEGORY_ICONS[cat] || <Globe className="w-4 h-4" />;

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
                isActive
                  ? 'text-signal-green bg-signal-green/5 border-r-2 border-signal-green'
                  : 'text-terminal-muted dark:text-gray-400 hover:text-terminal-text dark:hover:text-white hover:bg-terminal-border/15 dark:hover:bg-white/5'
              }`}
            >
              {icon}
              <span className="capitalize flex-1 text-left truncate">{cat}</span>
              <span className={`text-[12px] tabular-nums ${isActive ? 'text-signal-green/70' : 'text-terminal-muted dark:text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
