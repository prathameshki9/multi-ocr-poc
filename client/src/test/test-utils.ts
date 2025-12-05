import * as React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(BrowserRouter, null, children)
  )
  
  return render(ui, {
    wrapper: Wrapper,
    ...options,
  })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render } 