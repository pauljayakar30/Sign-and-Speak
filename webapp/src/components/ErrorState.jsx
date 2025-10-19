/**
 * Error State Component
 * 
 * Display when an error occurs, with friendly messaging and recovery options.
 * Replaces technical error text with user-friendly, actionable guidance.
 * 
 * @component
 * @example
 * // Basic error
 * <ErrorState
 *   title="Oops! Something went wrong"
 *   description="We couldn't load that content. Please try again."
 *   onRetry={() => refetch()}
 * />
 * 
 * // Network error
 * <ErrorState
 *   icon="📡"
 *   title="Connection lost"
 *   description="Check your internet connection and try again."
 *   retryText="Reconnect"
 *   onRetry={handleReconnect}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './Button.css';
import './ErrorState.css';

const ErrorState = ({
  icon = '⚠️',
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  retryText = 'Try Again',
  onRetry,
  dismissText,
  onDismiss,
  variant = 'default',
  size = 'md',
  className = '',
  error, // Optional Error object for debugging
  ...props
}) => {
  const errorStateClasses = [
    'error-state',
    `error-state--${variant}`,
    `error-state--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div 
      className={errorStateClasses} 
      role="alert" 
      aria-live="assertive"
      {...props}
    >
      <div className="error-state__icon" aria-hidden="true">
        {icon}
      </div>
      
      <h3 className="error-state__title">{title}</h3>
      
      {description && (
        <p className="error-state__description">{description}</p>
      )}
      
      {/* Developer error details (only in dev mode) */}
      {error && process.env.NODE_ENV === 'development' && (
        <details className="error-state__details">
          <summary>Technical details</summary>
          <pre className="error-state__error-text">
            {error.stack || error.message || String(error)}
          </pre>
        </details>
      )}
      
      <div className="error-state__actions">
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
          >
            {retryText}
          </Button>
        )}
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="md"
            onClick={onDismiss}
          >
            {dismissText || 'Dismiss'}
          </Button>
        )}
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  /** Emoji or icon to display */
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  
  /** Error heading text */
  title: PropTypes.string.isRequired,
  
  /** Supporting description text */
  description: PropTypes.string,
  
  /** Text for retry button */
  retryText: PropTypes.string,
  
  /** Handler for retry button click */
  onRetry: PropTypes.func,
  
  /** Text for dismiss button */
  dismissText: PropTypes.string,
  
  /** Handler for dismiss button click */
  onDismiss: PropTypes.func,
  
  /** Visual style variant */
  variant: PropTypes.oneOf(['default', 'compact', 'inline']),
  
  /** Size of error state */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Error object (for dev debugging) */
  error: PropTypes.oneOfType([PropTypes.instanceOf(Error), PropTypes.object]),
};

/**
 * Prebuilt Error State Patterns
 */

// Network error
export const NetworkError = ({ onRetry }) => (
  <ErrorState
    icon="📡"
    title="Connection lost"
    description="We couldn't connect to the server. Check your internet connection and try again."
    retryText="Reconnect"
    onRetry={onRetry}
    variant="default"
  />
);

NetworkError.propTypes = {
  onRetry: PropTypes.func,
};

// API error
export const APIError = ({ onRetry, message }) => (
  <ErrorState
    icon="🔌"
    title="Failed to load data"
    description={message || "We couldn't fetch the data. This might be a temporary issue."}
    retryText="Retry"
    onRetry={onRetry}
    variant="default"
  />
);

APIError.propTypes = {
  onRetry: PropTypes.func,
  message: PropTypes.string,
};

// Camera error
export const CameraError = ({ onRetry }) => (
  <ErrorState
    icon="📷"
    title="Camera unavailable"
    description="We couldn't access your camera. Make sure you've granted camera permissions and no other app is using it."
    retryText="Try Again"
    onRetry={onRetry}
    variant="default"
  />
);

CameraError.propTypes = {
  onRetry: PropTypes.func,
};

// Permission error
export const PermissionError = ({ onRequestPermission, permissionType = 'camera' }) => (
  <ErrorState
    icon="🔒"
    title="Permission required"
    description={`This feature needs access to your ${permissionType}. Please grant permission to continue.`}
    retryText="Grant Permission"
    onRetry={onRequestPermission}
    variant="default"
  />
);

PermissionError.propTypes = {
  onRequestPermission: PropTypes.func,
  permissionType: PropTypes.string,
};

// Generic error with dismiss
export const GenericError = ({ title, description, onDismiss }) => (
  <ErrorState
    icon="⚠️"
    title={title || "Something went wrong"}
    description={description || "An unexpected error occurred. Please try again or contact support if this persists."}
    dismissText="Okay"
    onDismiss={onDismiss}
    variant="compact"
  />
);

GenericError.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onDismiss: PropTypes.func,
};

// Not found error
export const NotFoundError = ({ onGoBack }) => (
  <ErrorState
    icon="🔍"
    title="Not found"
    description="The page or resource you're looking for doesn't exist."
    retryText="Go Back"
    onRetry={onGoBack}
    variant="default"
  />
);

NotFoundError.propTypes = {
  onGoBack: PropTypes.func,
};

export default ErrorState;
