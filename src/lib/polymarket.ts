import axios from 'axios';

const GAMMA_API = 'https://gamma-api.polymarket.com';

interface GammaEvent {
  id: string;
  slug: string;
  title: string;
}

export interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  category?: string;
  end_date_iso?: string;
  endDate?: string;
  liquidity: string;
  volume: string;
  outcomes: string;
  outcomePrices: string;
  active: boolean;
  closed: boolean;
  description?: string;
  image?: string;
  events?: GammaEvent[];
}

export async function fetchMarkets(): Promise<GammaMarket[]> {
  const allMarkets: GammaMarket[] = [];
  const limit = 100;
  let offset = 0;
  const maxPages = 10;

  for (let page = 0; page < maxPages; page++) {
    try {
      const { data } = await axios.get<GammaMarket[]>(`${GAMMA_API}/markets`, {
        params: {
          limit,
          offset,
          active: true,
          closed: false,
          order: 'liquidity',
          ascending: false,
        },
        timeout: 15000,
      });

      if (!data || data.length === 0) break;
      allMarkets.push(...data);
      offset += limit;

      if (data.length < limit) break;
    } catch (err) {
      console.error(`Failed to fetch markets page ${page}:`, err);
      break;
    }
  }

  return allMarkets;
}

export function getPolymarketUrl(market: GammaMarket): string {
  // Use the event slug if available (correct URL), fallback to market slug
  const eventSlug = market.events?.[0]?.slug;
  if (eventSlug) {
    return `https://polymarket.com/event/${eventSlug}`;
  }
  return `https://polymarket.com/event/${market.slug}`;
}

export function parseOutcomes(market: GammaMarket): { name: string; price: number }[] {
  try {
    const names: string[] = JSON.parse(market.outcomes || '[]');
    const prices: number[] = JSON.parse(market.outcomePrices || '[]');

    return names.map((name, i) => ({
      name,
      price: typeof prices[i] === 'string' ? parseFloat(prices[i]) : (prices[i] ?? 0),
    }));
  } catch {
    return [];
  }
}

export function getTimeRemaining(endDate: string | undefined): number {
  if (!endDate) return Infinity;
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(0, end - now);
}

export function formatTimeRemaining(ms: number): string {
  if (ms === Infinity || ms <= 0) return '--';

  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function calculateExpectedReturn(price: number): number {
  if (price <= 0 || price >= 1) return 0;
  return ((1 - price) / price) * 100;
}
