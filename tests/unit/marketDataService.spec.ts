import { MarketDataService } from '../../services/marketDataService';

describe('MarketDataService.formatMarketCap', () => {
  it('formats trillions correctly', () => {
    expect(MarketDataService.formatMarketCap(1_500_000_000_000)).toBe('1.50T');
  });

  it('formats billions correctly', () => {
    expect(MarketDataService.formatMarketCap(3_200_000_000)).toBe('3.20B');
  });

  it('formats millions correctly', () => {
    expect(MarketDataService.formatMarketCap(25_400_000)).toBe('25.40M');
  });

  it('returns dash for empty values', () => {
    expect(MarketDataService.formatMarketCap(0)).toBe('-');
  });
});
