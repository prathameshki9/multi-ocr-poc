import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AdminRoute } from '@/components/admin-route'
import { useAuthStore } from '@/utils/store'

// Mock the Outlet component from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Admin Content</div>,
  }
})

describe('AdminRoute', () => {
  beforeEach(() => {
    // Reset auth state before each test
    useAuthStore.getState().logout()
  })

  it('should redirect to home when user is not admin', () => {
    render(<AdminRoute />)
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('should render outlet when user is admin', () => {
    // Set admin user
    useAuthStore.getState().setAuth('admin-token', {
      id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN'
    })
    render(<AdminRoute />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
}) 