import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangeIndicator } from './change-indicator';

describe('ChangeIndicator', () => {
  it('renders positive value with up arrow', () => {
    render(<ChangeIndicator value={2.34} />);
    expect(screen.getByText((content) => content.includes('2.34'))).toBeInTheDocument();
  });

  it('renders negative value with down arrow', () => {
    render(<ChangeIndicator value={-1.5} />);
    expect(screen.getByText((content) => content.includes('1.50'))).toBeInTheDocument();
  });

  it('renders zero value', () => {
    render(<ChangeIndicator value={0} />);
    expect(screen.getByText((content) => content.includes('0.00'))).toBeInTheDocument();
  });

  it('applies badge variant classes', () => {
    const { container } = render(<ChangeIndicator value={5} badge />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('applies custom className', () => {
    const { container } = render(<ChangeIndicator value={1} className="ml-2" />);
    expect(container.firstChild).toHaveClass('ml-2');
  });
});
