import { render, screen } from '@/test/test-utils';
import Home from '@/pages/home';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'welcome' ? 'Hello World' : key),
  }),
}));

describe('Home', () => {
  it('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
}); 