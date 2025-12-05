import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '@/components/header';
import { useAuthStore } from '@/utils/store';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'header.home': 'Home',
      'header.dashboard': 'Dashboard',
      'header.signOut': 'Sign Out',
    }[key]),
  }),
}));

// Mock language switcher
vi.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => <div>Language Switcher</div>,
}));

// Mock auth store
vi.mock('@/utils/store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header', () => {
  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render basic header elements for regular user', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'USER' },
      logout: vi.fn(),
    });

    renderHeader();

    // Check basic elements
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Language Switcher')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();

    // Dashboard link should not be visible for regular users
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should render dashboard link for admin users', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' },
      logout: vi.fn(),
    });

    renderHeader();

    // Dashboard link should be visible for admin users
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should handle sign out correctly', () => {
    const mockLogout = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'USER' },
      logout: mockLogout,
    });

    renderHeader();

    // Click sign out button
    fireEvent.click(screen.getByText('Sign Out'));

    // Check if logout was called and navigation occurred
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/auth/sign-in');
  });

  it('should navigate to home when clicking home link', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'USER' },
      logout: vi.fn(),
    });

    renderHeader();

    // Click home link
    fireEvent.click(screen.getByText('Home'));

    // Check if the link has the correct href
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
  });

  it('should navigate to dashboard when clicking dashboard link as admin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' },
      logout: vi.fn(),
    });

    renderHeader();

    // Click dashboard link
    fireEvent.click(screen.getByText('Dashboard'));

    // Check if the link has the correct href
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
  });
}); 