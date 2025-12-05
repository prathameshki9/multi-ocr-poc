import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    await button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
}) 