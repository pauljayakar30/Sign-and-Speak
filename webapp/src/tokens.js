/**
 * Design Tokens - JavaScript API for CSS Custom Properties
 * 
 * This module provides programmatic access to design system values
 * defined in styles.css. Use these tokens instead of hardcoding values
 * in inline styles or JavaScript.
 * 
 * @example
 * import { colors, spacing, shadows } from './tokens';
 * 
 * // Instead of: style={{ color: '#4F46E5', padding: '16px' }}
 * // Use: style={{ color: colors.primary, padding: spacing[4] }}
 * 
 * @since 2025-10-19
 */

/**
 * Color Palette
 * Matches CSS custom properties in :root
 * All colors are WCAG AA compliant (4.5:1 minimum contrast)
 */
export const colors = {
  // Brand Colors
  primary: '#4F46E5',        // Indigo 600
  primaryLight: '#6366F1',   // Indigo 500
  primaryDark: '#4338CA',    // Indigo 700
  
  secondary: '#059669',      // Emerald 600
  secondaryLight: '#10B981', // Emerald 500
  
  accent: '#D97706',         // Amber 600
  accentLight: '#F59E0B',    // Amber 500
  
  danger: '#DC2626',         // Red 600
  
  // Neutrals
  ink: '#0F172A',           // Slate 900 (Maximum contrast)
  inkLight: '#1E293B',      // Slate 800
  
  bg: '#FFFFFF',            // Pure white
  bgAlt: '#F8FAFC',         // Slate 50
  
  card: '#FFFFFF',
  
  border: '#CBD5E1',        // Slate 300
  borderLight: '#E2E8F0',   // Slate 200
  
  muted: '#475569',         // Slate 600 (WCAG AA: 4.5:1)
  mutedLight: '#64748B',    // Slate 500
  
  // Semantic Colors
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#3B82F6',
  
  // Special Purpose
  gold: '#FFD700',
  focusRing: '#3B82F6',
};

/**
 * Gradients
 * Linear gradients for buttons, cards, and decorative elements
 */
export const gradients = {
  primary: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  secondary: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
  warm: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)',
  brand: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)',
  cta: 'linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(124,58,237,0.95) 50%, rgba(147,51,234,0.95) 100%)',
};

/**
 * Spacing System - 8pt Grid
 * Each unit = 4px base
 * Use these instead of arbitrary pixel values
 */
export const spacing = {
  0: '0',
  1: '4px',    // var(--space-1)
  2: '8px',    // var(--space-2)
  3: '12px',   // var(--space-3)
  4: '16px',   // var(--space-4)
  5: '20px',   // var(--space-5)
  6: '24px',   // var(--space-6)
  8: '32px',   // var(--space-8)
  10: '40px',  // var(--space-10)
  12: '48px',  // var(--space-12)
  16: '64px',  // var(--space-16)
  20: '80px',  // var(--space-20)
  24: '96px',  // var(--space-24)
};

/**
 * Typography System
 * Fluid responsive scales using clamp()
 */
export const typography = {
  // Font Families
  fontDisplay: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  
  // Font Sizes (use CSS variables for fluid scaling)
  size: {
    display: 'var(--text-display)',     // 40-64px
    h1: 'var(--text-h1)',               // 32-48px
    h2: 'var(--text-h2)',               // 24-36px
    h3: 'var(--text-h3)',               // 18-24px
    h4: 'var(--text-h4)',               // 16-20px
    lead: 'var(--text-lead)',           // 18-20px
    lg: 'var(--text-lg)',               // 18px
    body: 'var(--text-body)',           // 16px
    sm: 'var(--text-sm)',               // 14px
    xs: 'var(--text-xs)',               // 12px
    caption: 'var(--text-caption)',     // 12-13px
  },
  
  // Font Weights
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.015em',
    normal: '0',
    wide: '0.05em',
  },
};

/**
 * Border Radius System
 */
export const radius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

/**
 * Shadow Elevation System
 * Material Design inspired depth levels
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
  lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.08)',
  xl: '0 20px 25px rgba(0,0,0,0.12), 0 10px 10px rgba(0,0,0,0.08)',
  '2xl': '0 25px 50px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1)',
  
  // Named elevations
  elevation1: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  elevation2: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
  elevation3: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.08)',
  elevation4: '0 20px 25px rgba(0,0,0,0.12), 0 10px 10px rgba(0,0,0,0.08)',
  elevation5: '0 25px 50px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1)',
};

/**
 * Z-Index Layers
 * Application-wide stacking context
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

/**
 * Breakpoints
 * Use with CSS media queries or matchMedia API
 */
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
};

/**
 * Transition Durations
 * Consistent animation timing
 */
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Component-Specific Tokens
 */
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
    padding: {
      sm: '8px 16px',
      md: '12px 24px',
      lg: '16px 32px',
      xl: '20px 40px',
    },
  },
  
  input: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
  },
  
  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
  },
};

/**
 * Utility Functions
 */

/**
 * Get CSS variable value at runtime
 * @param {string} varName - CSS variable name (with or without --)
 * @returns {string} Computed value
 * 
 * @example
 * const primaryColor = getCSSVar('--primary');
 * const spacing4 = getCSSVar('space-4');
 */
export function getCSSVar(varName) {
  const name = varName.startsWith('--') ? varName : `--${varName}`;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Set CSS variable value at runtime
 * @param {string} varName - CSS variable name
 * @param {string} value - New value
 * 
 * @example
 * setCSSVar('--primary', '#FF0000');
 */
export function setCSSVar(varName, value) {
  const name = varName.startsWith('--') ? varName : `--${varName}`;
  document.documentElement.style.setProperty(name, value);
}

/**
 * Check if user prefers dark mode
 * @returns {boolean}
 */
export function prefersDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Media query hook helper
 * @param {string} query - Media query string
 * @returns {boolean}
 * 
 * @example
 * const isMobile = matchMedia(`(max-width: ${breakpoints.tablet})`);
 */
export function matchMedia(query) {
  return window.matchMedia(query).matches;
}

/**
 * Default export with all tokens
 */
export default {
  colors,
  gradients,
  spacing,
  typography,
  radius,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  components,
  getCSSVar,
  setCSSVar,
  prefersDarkMode,
  prefersReducedMotion,
  matchMedia,
};
