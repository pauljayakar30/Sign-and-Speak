/**
 * Skeleton Loader Component
 * 
 * Modern loading placeholder with shimmer animation.
 * Replaces generic "Loading..." or "Thinking..." text with professional skeletons.
 * 
 * @component
 * @example
 * // Text skeleton
 * <Skeleton variant="text" width="200px" />
 * 
 * // Card skeleton
 * <Skeleton variant="card" height="120px" />
 * 
 * // Multiple lines
 * <Skeleton variant="text" lines={3} />
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Skeleton.css';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  circle = false,
  className = '',
  animation = 'shimmer',
  ...props
}) => {
  // Single skeleton element
  const renderSkeleton = (index = 0) => {
    const skeletonClasses = [
      'skeleton',
      `skeleton--${variant}`,
      `skeleton--animation-${animation}`,
      circle && 'skeleton--circle',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const style = {
      width: width,
      height: height,
    };

    // For text variant, apply width to last line only (common pattern)
    if (variant === 'text' && lines > 1 && index === lines - 1) {
      style.width = width || '60%';
    }

    return (
      <div
        key={index}
        className={skeletonClasses}
        style={style}
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading content"
        {...props}
      />
    );
  };

  // Multiple lines for text variant
  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-group">
        {Array.from({ length: lines }).map((_, index) => renderSkeleton(index))}
      </div>
    );
  }

  return renderSkeleton();
};

Skeleton.propTypes = {
  /** Visual style variant */
  variant: PropTypes.oneOf(['text', 'card', 'avatar', 'button', 'circle', 'rect']),
  
  /** Width of skeleton (CSS value) */
  width: PropTypes.string,
  
  /** Height of skeleton (CSS value) */
  height: PropTypes.string,
  
  /** Number of lines (for text variant) */
  lines: PropTypes.number,
  
  /** Render as circle (for avatars) */
  circle: PropTypes.bool,
  
  /** Animation type */
  animation: PropTypes.oneOf(['shimmer', 'pulse', 'none']),
  
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * Skeleton Group - Multiple skeletons with consistent spacing
 */
export const SkeletonGroup = ({ children, gap = 'md', className = '' }) => {
  const groupClasses = [
    'skeleton-group',
    `skeleton-group--gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={groupClasses}>{children}</div>;
};

SkeletonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  gap: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

/**
 * Prebuilt Skeleton Patterns
 */

// Card skeleton with avatar, title, and content
export const CardSkeleton = () => (
  <div className="skeleton-card-pattern">
    <div className="skeleton-card-pattern__header">
      <Skeleton variant="avatar" width="48px" height="48px" circle />
      <div className="skeleton-card-pattern__header-content">
        <Skeleton variant="text" width="120px" />
        <Skeleton variant="text" width="80px" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
  </div>
);

// Feed item skeleton
export const FeedItemSkeleton = () => (
  <div className="skeleton-feed-item">
    <Skeleton variant="avatar" width="40px" height="40px" circle />
    <div className="skeleton-feed-item__content">
      <Skeleton variant="text" width="150px" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
);

// Button skeleton
export const ButtonSkeleton = ({ size = 'md' }) => {
  const heights = { sm: '32px', md: '40px', lg: '48px', xl: '56px' };
  const widths = { sm: '80px', md: '120px', lg: '140px', xl: '160px' };
  
  return (
    <Skeleton
      variant="button"
      width={widths[size]}
      height={heights[size]}
    />
  );
};

ButtonSkeleton.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};

// Feature card skeleton (for homepage)
export const FeatureCardSkeleton = () => (
  <div className="skeleton-feature-card">
    <Skeleton variant="circle" width="64px" height="64px" circle />
    <Skeleton variant="text" width="150px" />
    <Skeleton variant="text" lines={2} />
  </div>
);

// KPI skeleton (for dashboard)
export const KPISkeleton = () => (
  <div className="skeleton-kpi">
    <Skeleton variant="text" width="80px" />
    <Skeleton variant="text" width="60px" height="32px" />
  </div>
);

export default Skeleton;
