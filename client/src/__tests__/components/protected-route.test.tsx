import * as React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuthStore } from '@/utils/store'

// Mock the Outlet component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Protected Content</div>,
  }
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset auth state before each test
    useAuthStore.getState().logout()
  })

  it('should redirect to sign-in when not logged in', () => {
    render(<ProtectedRoute />)
    
    // Should not render the outlet content
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument()
    // Should be on the sign-in page
    expect(window.location.pathname).toBe('/auth/sign-in')
  })

  it('should render outlet when logged in', () => {
    // Set logged in state
    useAuthStore.getState().setAuth('test-token', {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'MEMBER'
    })

    render(<ProtectedRoute />)
    
    // Should render the outlet content
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
}) 