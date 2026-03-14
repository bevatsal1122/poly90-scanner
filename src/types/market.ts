export interface MarketOutcome {
  name: string;
  price: number;
}

export interface Market {
  id: string;
  question: string;
  slug: string;
  category: string;
  endDate: string;
  liquidity: number;
  volume: number;
  outcomes: MarketOutcome[];
  bestOutcome: string;
  bestPrice: number;
  expectedReturn: number;
  timeRemaining: number;
  timeRemainingLabel: string;
  polymarketUrl: string;
  active: boolean;
  closed: boolean;
  description?: string;
  image?: string;
  priceChange?: number;
  priceHistory?: number[];
}

export type TimeFilter =
  | 'all'
  | '10m'
  | '1h'
  | '6h'
  | '24h'
  | '7d';

export type ProbabilityFilter =
  | 'all'
  | '90-92'
  | '92-95'
  | '95-98'
  | '98-100';

export type SortField =
  | 'probability'
  | 'timeRemaining'
  | 'liquidity'
  | 'volume'
  | 'expectedReturn';

export type SortDirection = 'asc' | 'desc';

export interface Filters {
  tag: string;
  timeFilter: TimeFilter;
  probabilityFilter: ProbabilityFilter;
  minLiquidity: number;
  sortField: SortField;
  sortDirection: SortDirection;
  search: string;
}

export interface ScannerStats {
  totalMarkets: number;
  highProbMarkets: number;
  avgProbability: number;
  totalLiquidity: number;
  resolvingSoon: number;
}
