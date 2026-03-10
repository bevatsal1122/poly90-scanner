import { NextResponse } from 'next/server';
import {
  fetchMarkets,
  parseOutcomes,
  getPolymarketUrl,
  getTimeRemaining,
  formatTimeRemaining,
  calculateExpectedReturn,
} from '@/lib/polymarket';

const MIN_PROBABILITY = 0.90;
const MAX_PROBABILITY = 0.99; // Exclude 100% markets

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const rawMarkets = await fetchMarkets();
    const now = Date.now();

    const markets = rawMarkets
      .map((m) => {
        const outcomes = parseOutcomes(m);
        if (outcomes.length === 0) return null;

        const bestOutcome = outcomes.reduce((a, b) =>
          a.price > b.price ? a : b
        );

        // Filter: only 90%–99% probability
        if (bestOutcome.price < MIN_PROBABILITY) return null;
        if (bestOutcome.price > MAX_PROBABILITY) return null;

        const endDate = m.end_date_iso || m.endDate || '';
        const timeRemaining = getTimeRemaining(endDate);

        if (timeRemaining === 0) return null;

        const liquidity = parseFloat(m.liquidity) || 0;
        const volume = parseFloat(m.volume) || 0;

        return {
          id: m.id,
          question: m.question,
          slug: m.slug,
          category: (m.category || 'other').toLowerCase(),
          endDate,
          liquidity,
          volume,
          outcomes: outcomes.map((o) => ({ name: o.name, price: o.price })),
          bestOutcome: bestOutcome.name,
          bestPrice: bestOutcome.price,
          expectedReturn: calculateExpectedReturn(bestOutcome.price),
          timeRemaining,
          timeRemainingLabel: formatTimeRemaining(timeRemaining),
          polymarketUrl: getPolymarketUrl(m),
          active: m.active,
          closed: m.closed,
          description: m.description,
          image: m.image,
        };
      })
      .filter((m) => m !== null)
      .sort((a, b) => b.bestPrice - a.bestPrice);

    const categories = [...new Set(markets.map((m) => m.category))].sort();

    return NextResponse.json({
      markets,
      categories,
      timestamp: now,
      total: markets.length,
    });
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
