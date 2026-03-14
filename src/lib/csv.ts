import type { Market } from '@/types/market';

export function exportMarketsToCSV(markets: Market[]) {
  const headers = [
    'Question',
    'Outcome',
    'Probability',
    'Expected Return',
    'Liquidity',
    'Volume',
    'Time Remaining',
    'End Date',
    'Category',
    'URL',
  ];

  const rows = markets.map((m) => [
    `"${m.question.replace(/"/g, '""')}"`,
    `"${m.bestOutcome.replace(/"/g, '""')}"`,
    `${(m.bestPrice * 100).toFixed(2)}%`,
    `${m.expectedReturn.toFixed(2)}%`,
    m.liquidity.toFixed(0),
    m.volume.toFixed(0),
    m.timeRemainingLabel,
    m.endDate ? new Date(m.endDate).toISOString() : '',
    m.category,
    m.polymarketUrl,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `poly90-markets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
