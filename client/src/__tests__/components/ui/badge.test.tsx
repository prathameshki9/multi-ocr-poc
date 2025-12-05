import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge.tagName.toLowerCase()).toBe('span');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);

    const badge = screen.getByText('Destructive Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-destructive', 'text-white');
  });

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);

    const badge = screen.getByText('Outline Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-foreground');
  });

  it('should render with custom className', () => {
    const customClass = 'custom-class';
    render(<Badge className={customClass}>Custom Badge</Badge>);

    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass(customClass);
  });

  it('should render as a custom element when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="#">Link Badge</a>
      </Badge>
    );

    const badge = screen.getByText('Link Badge');
    expect(badge.tagName.toLowerCase()).toBe('a');
    expect(badge).toHaveAttribute('href', '#');
  });

  it('should forward additional props', () => {
    render(
      <Badge data-testid="test-badge" title="Test Title">
        Test Badge
      </Badge>
    );

    const badge = screen.getByTestId('test-badge');
    expect(badge).toHaveAttribute('title', 'Test Title');
  });
}); 