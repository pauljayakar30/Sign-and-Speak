/**
 * Empty State Component
 * 
 * Display when no data is available, guiding users to their next action.
 * Replaces blank areas with encouraging, actionable messaging.
 * 
 * @component
 * @example
 * // Basic empty state
 * <EmptyState
 *   icon="📭"
 *   title="No activity yet"
 *   description="Your child's activity will appear here once they start practicing."
 * />
 * 
 * // With action button
 * <EmptyState
 *   icon="🎯"
 *   title="No stickers earned"
 *   description="Complete your first sign to earn a sticker!"
 *   actionText="Start Practicing"
 *   onAction={() => navigate('/practice')}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './Button.css';
import './EmptyState.css';

const EmptyState = ({
  icon = '📭',
  title = 'No data available',
  description = "There's nothing here yet. Check back later!",
  actionText,
  onAction,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const emptyStateClasses = [
    'empty-state',
    `empty-state--${variant}`,
    `empty-state--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={emptyStateClasses} role="status" aria-live="polite" {...props}>
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      
      <h3 className="empty-state__title">{title}</h3>
      
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      
      {actionText && onAction && (
        <div className="empty-state__action">
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  /** Emoji or icon to display (string or React element) */
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  
  /** Primary heading text */
  title: PropTypes.string.isRequired,
  
  /** Supporting description text */
  description: PropTypes.string,
  
  /** Text for call-to-action button */
  actionText: PropTypes.string,
  
  /** Handler for CTA button click */
  onAction: PropTypes.func,
  
  /** Visual style variant */
  variant: PropTypes.oneOf(['default', 'compact', 'centered']),
  
  /** Size of empty state */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * Prebuilt Empty State Patterns
 */

// No feed items (ParentDashboard)
export const EmptyFeed = ({ onConnect }) => (
  <EmptyState
    icon="📭"
    title="No activity yet"
    description="Connect with your child to see their sign language practice activity in real-time."
    actionText={onConnect ? "Generate Pairing Code" : undefined}
    onAction={onConnect}
    variant="centered"
  />
);

EmptyFeed.propTypes = {
  onConnect: PropTypes.func,
};

// No stickers (StickerBook)
export const EmptyStickers = ({ onStartPractice }) => (
  <EmptyState
    icon="🎯"
    title="No stickers yet"
    description="Practice sign language to collect your first sticker! Each new sign you learn earns a special reward."
    actionText={onStartPractice ? "Start Practicing" : undefined}
    onAction={onStartPractice}
    variant="centered"
    size="lg"
  />
);

EmptyStickers.propTypes = {
  onStartPractice: PropTypes.func,
};

// No training history
export const EmptyHistory = ({ onStartTraining }) => (
  <EmptyState
    icon="📊"
    title="No practice history"
    description="Your practice sessions will be recorded here. Start your first training session to track your progress!"
    actionText={onStartTraining ? "Begin Training" : undefined}
    onAction={onStartTraining}
    variant="centered"
  />
);

EmptyHistory.propTypes = {
  onStartTraining: PropTypes.func,
};

// Not paired (child view)
export const EmptyPairing = ({ onEnterCode }) => (
  <EmptyState
    icon="🔗"
    title="Not connected"
    description="Ask your parent or guardian for a pairing code to connect your accounts and share your progress."
    actionText={onEnterCode ? "Enter Code" : undefined}
    onAction={onEnterCode}
    variant="centered"
  />
);

EmptyPairing.propTypes = {
  onEnterCode: PropTypes.func,
};

// Generic search results
export const EmptySearch = ({ searchTerm, onClear }) => (
  <EmptyState
    icon="🔍"
    title="No results found"
    description={searchTerm ? `No matches for "${searchTerm}". Try a different search term.` : "No results match your search criteria."}
    actionText={onClear ? "Clear Search" : undefined}
    onAction={onClear}
    variant="compact"
    size="sm"
  />
);

EmptySearch.propTypes = {
  searchTerm: PropTypes.string,
  onClear: PropTypes.func,
};

export default EmptyState;
