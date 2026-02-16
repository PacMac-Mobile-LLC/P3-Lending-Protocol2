import { shortenAddress } from '../../services/walletService';

describe('shortenAddress', () => {
  it('returns empty string for empty input', () => {
    expect(shortenAddress('')).toBe('');
  });

  it('shortens a standard ethereum address', () => {
    const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    expect(shortenAddress(address)).toBe('0x71C7...976F');
  });
});
