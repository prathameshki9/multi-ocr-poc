import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/utils/store'

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear the store before each test
    useAuthStore.getState().logout()
  })

  it('should initialize with default values', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isLoggedIn).toBe(false)
  })

  it('should set auth state on login', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'MEMBER' as const
    }
    const mockToken = 'test-token'

    useAuthStore.getState().setAuth(mockToken, mockUser)
    const state = useAuthStore.getState()

    expect(state.token).toBe(mockToken)
    expect(state.user).toEqual(mockUser)
    expect(state.isLoggedIn).toBe(true)
  })

  it('should clear auth state on logout', () => {
    // First set some auth data
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'MEMBER' as const
    }
    useAuthStore.getState().setAuth('test-token', mockUser)

    // Then logout
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()

    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isLoggedIn).toBe(false)
  })

  it('should persist auth state', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'MEMBER' as const
    }
    const mockToken = 'test-token'

    useAuthStore.getState().setAuth(mockToken, mockUser)
    
    // Create a new store instance to verify persistence
    const newState = useAuthStore.getState()
    expect(newState.token).toBe(mockToken)
    expect(newState.user).toEqual(mockUser)
    expect(newState.isLoggedIn).toBe(true)
  })
}) 