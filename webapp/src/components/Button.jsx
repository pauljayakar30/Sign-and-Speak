/**
 * Button Component
 * 
 * Professional, reusable button with multiple variants, sizes, and states.
 * Replaces inconsistent button classes (.btn-primary, .primary, .gummy-btn, .secondary)
 * 
 * @component
 * @example
 * // Primary button
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Get Started
 * </Button>
 * 
 * // Secondary with icon
 * <Button variant="secondary" icon={<Icon />} iconPosition="left">
 *   Learn More
 * </Button>
 * 
 * // Loading state
 * <Button variant="primary" loading disabled>
 *   Processing...
 * </Button>
 */

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    icon && !children && 'btn--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    
    // Create ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const newRipple = {
        x,
        y,
        size,
        id: Date.now()
      };
      
      setRipples((prev) => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="btn__ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              className="btn__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn__icon btn__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {children && <span className="btn__content">{children}</span>}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

Button.propTypes = {
  /** Button content */
  children: PropTypes.node,
  
  /** Visual style variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  
  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  
  /** Expand to full width of container */
  fullWidth: PropTypes.bool,
  
  /** Disabled state */
  disabled: PropTypes.bool,
  
  /** Loading state (shows spinner, disables interaction) */
  loading: PropTypes.bool,
  
  /** Icon element to display */
  icon: PropTypes.node,
  
  /** Position of icon relative to text */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  
  /** HTML button type */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  
  /** Click handler */
  onClick: PropTypes.func,
  
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Button;
