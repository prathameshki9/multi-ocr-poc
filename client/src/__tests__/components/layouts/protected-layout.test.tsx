import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '@/components/layouts/protected-layout';

// Mock Header component
vi.mock('@/components/header', () => ({
  Header: () => <div data-testid="header">Header Component</div>,
}));

describe('ProtectedLayout', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render header and outlet content', () => {
    renderWithRouter();

    // Check if header is rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header Component')).toBeInTheDocument();

    // Check if outlet content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should have correct layout classes', () => {
    renderWithRouter();

    // Check if layout has correct classes
    const layout = screen.getByText('Header Component').parentElement;
    expect(layout).toHaveClass('min-h-screen', 'flex', 'flex-col');

    // Check if main has correct class
    const main = screen.getByText('Protected Content').parentElement;
    expect(main).toHaveClass('flex-1');
  });
}); 