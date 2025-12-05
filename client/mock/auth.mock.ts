import { defineMock } from 'vite-plugin-mock-dev-server'
import jwt from 'jsonwebtoken'
import type { IncomingHttpHeaders } from 'http'

// Types
type UserRole = 'MEMBER' | 'ADMIN'

interface User {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
}

interface UserResponse {
  id: number
  name: string
  email: string
  role: UserRole
}

// In-memory users store
const users = new Map<number, User>()

// Add a default admin user
users.set(1, {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'ADMIN',
})

// JWT secret key
const JWT_SECRET = 'your-secret-key'

// Helper functions
const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' })
}

const verifyToken = (token: string): { id: number; email: string; role: UserRole } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: UserRole }
  } catch {
    return null
  }
}

const excludePassword = (user: User): UserResponse => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

const getAuthUser = (headers: IncomingHttpHeaders): { id: number; role: UserRole } | null => {
  const authHeader = headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)
  return decoded ? { id: decoded.id, role: decoded.role } : null
}

// Mock endpoints
export default defineMock([
  {
    url: '/api/auth/sign-in',
    method: 'POST',
    body: async ({ body }) => {
      const { email, password } = body as { email: string; password: string }
      
      const user = Array.from(users.values()).find(u => u.email === email && u.password === password)
      
      if (!user) {
        return { status: 401, body: { error: 'Invalid credentials' } }
      }

      const token = generateToken(user)
      return {
        token,
        user: excludePassword(user),
      }
    },
  },
  {
    url: '/api/auth/sign-up',
    method: 'POST',
    body: async ({ body }) => {
      const { name, email, password } = body as { name: string; email: string; password: string }
      
      if (!name || !email || !password) {
        return { status: 400, body: { error: 'Missing required fields' } }
      }

      if (Array.from(users.values()).some(u => u.email === email)) {
        return { status: 400, body: { error: 'Email already exists' } }
      }

      const id = users.size + 1
      const newUser: User = {
        id,
        name,
        email,
        password,
        role: 'MEMBER',
      }

      users.set(id, newUser)
      const token = generateToken(newUser)

      return {
        token,
        user: excludePassword(newUser),
      }
    },
  },
  {
    url: '/api/users',
    method: 'GET',
    body: async ({ headers }) => {
      const authUser = getAuthUser(headers)
      
      if (!authUser) {
        return { status: 401, body: { error: 'Unauthorized' } }
      }

      const userList = Array.from(users.values()).map(excludePassword)
      return userList
    },
  },
  {
    url: '/api/users/add',
    method: 'POST',
    body: async ({ headers, body }) => {
      const authUser = getAuthUser(headers)
      
      if (!authUser || authUser.role !== 'ADMIN') {
        return { status: 403, body: { error: 'Forbidden' } }
      }

      const { name, email, password, role = 'MEMBER' } = body as { name: string; email: string; password: string; role?: UserRole }
      
      if (!name || !email || !password) {
        return { status: 400, body: { error: 'Missing required fields' } }
      }

      if (Array.from(users.values()).some(u => u.email === email)) {
        return { status: 400, body: { error: 'Email already exists' } }
      }

      const id = users.size + 1
      const newUser: User = {
        id,
        name,
        email,
        password,
        role,
      }

      users.set(id, newUser)
      return excludePassword(newUser)
    },
  },
  {
    url: '/api/users/delete',
    method: 'POST',
    body: async ({ headers, body }) => {
      const authUser = getAuthUser(headers)
      
      if (!authUser || authUser.role !== 'ADMIN') {
        return { status: 403, body: { error: 'Forbidden' } }
      }

      const { id } = body as { id: number }
      
      if (!users.has(id)) {
        return { status: 404, body: { error: 'User not found' } }
      }

      users.delete(id)
      return { message: 'User deleted successfully' }
    },
  },
  {
    url: '/api/me',
    method: 'GET',
    body: async ({ headers }) => {
      const authUser = getAuthUser(headers)
      
      if (!authUser) {
        return { status: 401, body: { error: 'Unauthorized' } }
      }

      const user = users.get(authUser.id)
      if (!user) {
        return { status: 404, body: { error: 'User not found' } }
      }

      const token = generateToken(user)
      return {
        token,
        user: excludePassword(user),
      }
    },
  },
]) 