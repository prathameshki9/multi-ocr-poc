import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/utils/api'
import { useAuthStore } from '@/utils/store'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}))

describe('API Utility', () => {
  const mockToken = 'test-token'
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'MEMBER' as const
  }

  beforeEach(() => {
    // Reset auth state
    useAuthStore.getState().logout()
    // Clear all mocks
    vi.clearAllMocks()
  })

  it('should make GET request with auth token when logged in', async () => {
    // Set auth state
    useAuthStore.getState().setAuth(mockToken, mockUser)

    const mockData = { data: 'test' }
    vi.mocked(api.get).mockResolvedValueOnce(mockData)

    const response = await api.get('/test')
    
    expect(response).toBe(mockData)
    expect(api.get).toHaveBeenCalledWith('/test')
  })

  it('should make POST request with auth token when logged in', async () => {
    // Set auth state
    useAuthStore.getState().setAuth(mockToken, mockUser)

    const mockData = { data: 'test' }
    const postData = { test: 'data' }
    vi.mocked(api.post).mockResolvedValueOnce(mockData)

    const response = await api.post('/test', postData)
    
    expect(response).toBe(mockData)
    expect(api.post).toHaveBeenCalledWith('/test', postData)
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    vi.mocked(api.get).mockRejectedValueOnce(error)

    await expect(api.get('/test')).rejects.toThrow('API Error')
  })
}) 