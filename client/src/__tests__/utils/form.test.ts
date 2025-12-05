import { signInSchema, signUpSchema, addUserSchema } from '@/utils/form';
import { describe, it, expect } from 'vitest';

describe('signInSchema', () => {
  it('accepts valid input', () => {
    expect(() => signInSchema.parse({ email: 'test@example.com', password: 'pass' })).not.toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => signInSchema.parse({ email: 'invalid', password: 'pass' })).toThrow('Please enter a valid email address');
  });

  it('rejects empty password', () => {
    expect(() => signInSchema.parse({ email: 'test@example.com', password: '' })).toThrow('Password is required');
  });
});

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    expect(() => signUpSchema.parse({ name: 'John', email: 'john@example.com', password: 'password1', confirmPassword: 'password1' })).not.toThrow();
  });

  it('rejects short password', () => {
    expect(() => signUpSchema.parse({ name: 'John', email: 'john@example.com', password: 'short', confirmPassword: 'short' })).toThrow('Password must be at least 8 characters');
  });

  it('rejects non-matching passwords', () => {
    expect(() => signUpSchema.parse({ name: 'John', email: 'john@example.com', password: 'password1', confirmPassword: 'password2' })).toThrow("Passwords don't match");
  });
});

describe('addUserSchema', () => {
  it('accepts valid input', () => {
    expect(() => addUserSchema.parse({ name: 'Jane', email: 'jane@example.com', password: 'password1', confirmPassword: 'password1', role: 'ADMIN' })).not.toThrow();
  });

  it('rejects invalid role', () => {
    expect(() => addUserSchema.parse({ name: 'Jane', email: 'jane@example.com', password: 'password1', confirmPassword: 'password1', role: 'UNKNOWN' })).toThrow();
  });

  it('rejects non-matching passwords', () => {
    expect(() => addUserSchema.parse({ name: 'Jane', email: 'jane@example.com', password: 'password1', confirmPassword: 'different', role: 'MEMBER' })).toThrow("Passwords don't match");
  });
}); 