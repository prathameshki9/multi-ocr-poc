import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup() // cleanup after each test to avoid memory leaks and prevent tests from affecting each other and polluting the DOM.
}) 