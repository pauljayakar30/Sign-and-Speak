/**
 * Toast Notification Component
 * 
 * Temporary notification messages with auto-dismiss.
 * Provides feedback for user actions (success, errors, warnings, info).
 * 
 * @component
 * @example
 * // Using the hook
 * const toast = useToast();
 * toast.success('Sign recognized!');
 * toast.error('Connection failed');
 * 
 * // Custom toast
 * toast.show({
 *   variant: 'info',
 *   message: 'Saving...',
 *   duration: 5000
 * });
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

// Toast Context
const ToastContext = createContext(null);

/**
 * Toast Hook - Access toast functions from any component
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider - Wrap your app with this
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const show = useCallback((options) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      variant: options.variant || 'info',
      message: options.message || '',
      duration: options.duration || 3500,
      icon: options.icon,
      action: options.action,
      onAction: options.onAction,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration);
    }

    return id;
  }, []);

  // Remove a toast
  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return show({ ...options, variant: 'success', message });
  }, [show]);

  const error = useCallback((message, options = {}) => {
    return show({ ...options, variant: 'error', message });
  }, [show]);

  const warning = useCallback((message, options = {}) => {
    return show({ ...options, variant: 'warning', message });
  }, [show]);

  const info = useCallback((message, options = {}) => {
    return show({ ...options, variant: 'info', message });
  }, [show]);

  const value = {
    show,
    remove,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Toast Container - Renders all active toasts
 */
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      variant: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
};

/**
 * Individual Toast Component
 */
const Toast = ({ id, variant, message, icon, action, onAction, onClose, duration }) => {
  const [progress, setProgress] = useState(100);

  // Progress bar animation
  useEffect(() => {
    if (!duration || duration <= 0) return;

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(intervalId);
      }
    }, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [duration]);

  // Default icons per variant
  const defaultIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const displayIcon = icon || defaultIcons[variant] || defaultIcons.info;

  const toastClasses = [
    'toast',
    `toast--${variant}`,
    'toast--enter',
  ].join(' ');

  return (
    <div
      className={toastClasses}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast__icon" aria-hidden="true">
        {displayIcon}
      </div>

      <div className="toast__content">
        <p className="toast__message">{message}</p>
      </div>

      {action && onAction && (
        <button
          className="toast__action"
          onClick={onAction}
          type="button"
        >
          {action}
        </button>
      )}

      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Close notification"
        type="button"
      >
        ×
      </button>

      {duration > 0 && (
        <div className="toast__progress-bar">
          <div
            className="toast__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  icon: PropTypes.string,
  action: PropTypes.string,
  onAction: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Toast;
