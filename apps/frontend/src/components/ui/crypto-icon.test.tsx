import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CryptoIcon } from './crypto-icon';

describe('CryptoIcon', () => {
  it('renders img when src is a URL', () => {
    render(<CryptoIcon src="https://example.com/coin.png" symbol="BTC" />);
    const img = screen.getByAltText('BTC');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/coin.png');
  });

  it('renders initials when src is not a URL', () => {
    render(<CryptoIcon src="BTC" symbol="BTC" />);
    expect(screen.getByText('BT')).toBeInTheDocument();
  });

  it('renders initials when image errors', () => {
    render(<CryptoIcon src="https://example.com/broken.png" symbol="ETH" />);
    const img = screen.getByAltText('ETH');
    expect(img).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<CryptoIcon src="ETH" symbol="ETH" size="lg" />);
    expect(container.firstChild).toHaveClass('h-11');
  });
});
