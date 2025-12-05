import { describe, it, expect } from 'vitest'
import { render } from '@/test/test-utils'
import Spinner from '@/components/commons/spinner'

describe('Spinner', () => {
  it('renders with default size (md)', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toHaveClass('h-6', 'w-6', 'border-2')
  })

  it('renders with small size (sm)', () => {
    const { container } = render(<Spinner size="sm" />)
    expect(container.firstChild).toHaveClass('h-4', 'w-4', 'border-2')
  })

  it('renders with large size (lg)', () => {
    const { container } = render(<Spinner size="lg" />)
    expect(container.firstChild).toHaveClass('h-8', 'w-8', 'border-3')
  })
}) 