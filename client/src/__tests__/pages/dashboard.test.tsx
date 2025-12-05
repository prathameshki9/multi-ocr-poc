import { render, screen, waitFor } from '@/test/test-utils';
import Dashboard from '@/pages/dashboard';
import api from '@/utils/api';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        title: 'Users',
        addUser: 'Add User',
        'table.name': 'Name',
        'table.email': 'Email',
        'table.role': 'Role',
        'common:errors.somethingWentWrong': 'Something went wrong',
      };
      return translations[key] || key;
    },
  }),
}));

const mockUsers = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'ADMIN' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'MEMBER' },
];

describe('Dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders user table on successful API call', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockUsers });
    render(<Dashboard />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows error toast on API failure', async () => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('API error'));
    const toastError = vi.spyOn(toast, 'error');
    render(<Dashboard />);
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Something went wrong');
    });
  });
}); 