/**
 * Card Component
 * 
 * Flexible container component with multiple variants and elevations.
 * Replaces inconsistent card classes (.card, .feature-card, .floating-card, .gummy-card)
 * 
 * @component
 * @example
 * // Basic card
 * <Card>
 *   <h3>Title</h3>
 *   <p>Content goes here</p>
 * </Card>
 * 
 * // Elevated card with custom padding
 * <Card variant="elevated" padding="lg">
 *   Content with elevation
 * </Card>
 * 
 * // Feature card (primary highlight)
 * <Card variant="feature" isPrimary>
 *   <div className="icon">🎥</div>
 *   <h3>Featured Item</h3>
 * </Card>
 * 
 * // Interactive card
 * <Card variant="default" hoverable onClick={handleClick}>
 *   Clickable card
 * </Card>
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  isPrimary = false,
  fullWidth = false,
  onClick,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    hoverable && 'card--hoverable',
    isPrimary && 'card--primary',
    fullWidth && 'card--full-width',
    onClick && 'card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Component
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {isPrimary && variant === 'feature' && (
        <span className="card__badge" aria-label="Featured">
          ⭐ FEATURED
        </span>
      )}
      {children}
    </Component>
  );
};

Card.propTypes = {
  /** Card content */
  children: PropTypes.node.isRequired,
  
  /** Visual style variant */
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'feature', 'floating']),
  
  /** Internal padding size */
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  
  /** Enable hover effects */
  hoverable: PropTypes.bool,
  
  /** Mark as primary/featured (only for feature variant) */
  isPrimary: PropTypes.bool,
  
  /** Expand to full width */
  fullWidth: PropTypes.bool,
  
  /** Click handler (makes card interactive) */
  onClick: PropTypes.func,
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** HTML element or React component to render as */
  as: PropTypes.elementType,
};

export default Card;
