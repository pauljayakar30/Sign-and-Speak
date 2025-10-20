/**
 * Card Component Tests
 * Tests variants, hover states, click handling, and children rendering
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Card from './Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText(/card content/i)).toBeInTheDocument()
  })

  it('applies default card class', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card', 'card--default')
  })

  it('applies elevated variant class', () => {
    const { container } = render(<Card variant="elevated">Elevated card</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card', 'card--elevated')
  })

  it('applies feature variant class', () => {
    const { container } = render(<Card variant="feature">Feature card</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card', 'card--feature')
  })

  it('applies hoverable class when specified', () => {
    const { container } = render(<Card hoverable>Hover card</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card--hoverable')
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    const { container } = render(<Card onClick={handleClick}>Clickable card</Card>)
    const card = container.firstChild
    
    await user.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card', 'custom-class')
  })

  it('forwards additional props', () => {
    const { container } = render(
      <Card data-testid="test-card" aria-label="Test card">
        Content
      </Card>
    )
    const card = container.firstChild
    expect(card).toHaveAttribute('data-testid', 'test-card')
    expect(card).toHaveAttribute('aria-label', 'Test card')
  })

  it('renders complex children (JSX elements)', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    )
    
    expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument()
    expect(screen.getByText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('applies custom padding classes', () => {
    const { container } = render(<Card padding="lg">Large padding</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card--padding-lg')
  })

  it('applies primary style when isPrimary is true', () => {
    const { container } = render(<Card isPrimary>Primary card</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card--primary')
  })

  it('applies clickable class when onClick is provided', () => {
    const { container } = render(<Card onClick={() => {}}>Clickable</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('card--clickable')
  })
})
