/**
 * ErrorState Component Tests
 * Tests title, description, retry functionality, and accessibility
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  it('renders with title and description', () => {
    render(
      <ErrorState 
        title="Test Error Title"
        description="Test error description"
      />
    )
    expect(screen.getByText(/test error title/i)).toBeInTheDocument()
    expect(screen.getByText(/test error description/i)).toBeInTheDocument()
  })

  it('displays custom icon', () => {
    const { container } = render(
      <ErrorState 
        icon="📷"
        title="Camera Error"
        description="Camera not found"
      />
    )
    expect(container.querySelector('.error-state__icon')).toHaveTextContent('📷')
  })

  it('displays default icon when not specified', () => {
    const { container } = render(
      <ErrorState 
        title="Error"
        description="Something went wrong"
      />
    )
    expect(container.querySelector('.error-state__icon')).toHaveTextContent('⚠️')
  })

  it('calls onRetry when retry button is clicked', async () => {
    const handleRetry = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ErrorState 
        title="Error"
        description="Try again"
        onRetry={handleRetry} 
      />
    )
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)
    
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(
      <ErrorState 
        title="Error"
        description="No retry available"
      />
    )
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('displays custom retry text', async () => {
    render(
      <ErrorState 
        title="Error"
        description="Try again"
        retryText="Restart Camera"
        onRetry={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /restart camera/i })).toBeInTheDocument()
  })

  it('has role="alert" for accessibility', () => {
    const { container } = render(
      <ErrorState 
        title="Error"
        description="Alert message"
      />
    )
    const alert = container.querySelector('[role="alert"]')
    expect(alert).toBeInTheDocument()
  })

  it('applies size variant classes', () => {
    const { container } = render(
      <ErrorState 
        title="Error"
        description="Description"
        size="lg"
      />
    )
    const errorState = container.querySelector('.error-state')
    expect(errorState).toHaveClass('error-state--lg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ErrorState 
        title="Error"
        description="Description"
        className="custom-error"
      />
    )
    const errorState = container.querySelector('.error-state')
    expect(errorState).toHaveClass('custom-error')
  })

  it('renders with dismiss button when onDismiss is provided', async () => {
    const handleDismiss = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ErrorState 
        title="Error"
        description="Dismissible error"
        dismissText="Close"
        onDismiss={handleDismiss}
      />
    )
    
    const dismissButton = screen.getByRole('button', { name: /close/i })
    await user.click(dismissButton)
    
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })
})
