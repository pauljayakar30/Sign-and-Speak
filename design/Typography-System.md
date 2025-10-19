# Typography System - Sign & Speak

## Overview
Professional typography system implemented following 2025 industry standards with fluid scaling, proper hierarchy, and accessibility compliance.

---

## Type Scale (Fluid with clamp())

### Display (Hero Headlines)
- **Size:** `clamp(2.5rem, 5vw + 1rem, 4rem)` → 40-64px
- **Line Height:** 1.1
- **Weight:** 800 (Extrabold)
- **Letter Spacing:** -0.02em
- **Use:** Landing page hero titles

### H1 (Page Titles)
- **Size:** `clamp(2rem, 3vw + 1rem, 3rem)` → 32-48px
- **Line Height:** 1.2
- **Weight:** 800 (Extrabold)
- **Letter Spacing:** -0.015em
- **Use:** Section headers, major page titles

### H2 (Section Titles)
- **Size:** `clamp(1.5rem, 2vw + 0.5rem, 2.25rem)` → 24-36px
- **Line Height:** 1.3
- **Weight:** 700 (Bold)
- **Letter Spacing:** -0.01em
- **Use:** Feature sections, content blocks

### H3 (Card Titles)
- **Size:** `clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)` → 18-24px
- **Line Height:** 1.4
- **Weight:** 700 (Bold)
- **Letter Spacing:** 0
- **Use:** Card headers, subsection titles

### H4 (Subsections)
- **Size:** `clamp(1rem, 1vw + 0.5rem, 1.25rem)` → 16-20px
- **Line Height:** 1.5
- **Weight:** 600 (Semibold)
- **Letter Spacing:** 0
- **Use:** Small headings, button text

---

## Body Text Scale

### Lead (Introductory Paragraph)
- **Size:** `clamp(1.125rem, 1vw + 0.5rem, 1.25rem)` → 18-20px
- **Line Height:** 1.7
- **Weight:** 400 (Regular)
- **Use:** Hero subtitles, important descriptions

### Body (Default)
- **Size:** `clamp(0.9375rem, 0.5vw + 0.75rem, 1rem)` → 15-16px
- **Line Height:** 1.6
- **Weight:** 400 (Regular)
- **Use:** Primary content, paragraphs, descriptions

### Small
- **Size:** `clamp(0.8125rem, 0.5vw + 0.625rem, 0.875rem)` → 13-14px
- **Line Height:** 1.5
- **Weight:** 400 (Regular)
- **Use:** Secondary content, metadata

### Caption/Label
- **Size:** `clamp(0.75rem, 0.25vw + 0.625rem, 0.8125rem)` → 12-13px
- **Line Height:** 1.4
- **Weight:** 500 (Medium)
- **Use:** Labels, badges, UI text

---

## Font Weight Scale

| Name | Value | Use Case |
|------|-------|----------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, captions, emphasis |
| Semibold | 600 | Tabs, secondary headings |
| Bold | 700 | Buttons, card titles, H2-H3 |
| Extrabold | 800 | Display text, H1, KPI values |

---

## CSS Variables

```css
/* Typography Scale */
--text-display: clamp(2.5rem, 5vw + 1rem, 4rem);
--text-h1: clamp(2rem, 3vw + 1rem, 3rem);
--text-h2: clamp(1.5rem, 2vw + 0.5rem, 2.25rem);
--text-h3: clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem);
--text-h4: clamp(1rem, 1vw + 0.5rem, 1.25rem);
--text-lead: clamp(1.125rem, 1vw + 0.5rem, 1.25rem);
--text-body: clamp(0.9375rem, 0.5vw + 0.75rem, 1rem);
--text-sm: clamp(0.8125rem, 0.5vw + 0.625rem, 0.875rem);
--text-xs: clamp(0.75rem, 0.25vw + 0.625rem, 0.8125rem);

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

---

## Utility Classes

### Size Classes
- `.text-display` - Hero display text
- `.text-lead` - Introductory paragraphs
- `.text-sm` - Small text
- `.text-xs` - Extra small text (labels)

### Weight Classes
- `.font-medium` - Medium weight (500)
- `.font-semibold` - Semibold (600)
- `.font-bold` - Bold (700)
- `.font-extrabold` - Extrabold (800)

---

## Implementation Examples

### Hero Section
```jsx
<h1 className="hero-title">
  Turn Gestures Into <span className="gradient-text">Words</span>
</h1>
<p className="hero-subtitle">
  An interactive platform that recognizes hand signs...
</p>
```

### Feature Card
```jsx
<h3 className="feature-title">Real-time Recognition</h3>
<p className="feature-desc">Detects 15+ signs instantly...</p>
```

### KPI Dashboard
```jsx
<div className="kpi">
  <div className="kpi-label">Practice Time</div>
  <div className="kpi-value">24 min</div>
</div>
```

---

## Accessibility Improvements

✅ **Fluid scaling** - Smooth transitions between breakpoints
✅ **Proper line heights** - Readable spacing (1.4-1.7)
✅ **Negative letter spacing** on large text - Optical balance
✅ **Semantic HTML** - h1-h6 hierarchy maintained
✅ **Contrast ratios** - All text meets WCAG AA standards
✅ **Font smoothing** - Antialiasing enabled globally

---

## Key Improvements Over Previous System

| Before | After |
|--------|-------|
| Fixed pixel sizes (56px, 40px, etc.) | Fluid clamp() responsive |
| Random font weights (600, 700, 800) | Systematic weight scale |
| No line-height standards | Proper 1.1-1.7 scale |
| Inconsistent letter spacing | Optical adjustments (-0.02em to 0) |
| Hard breakpoints | Smooth viewport scaling |
| No weight utilities | Complete utility class system |

---

## Browser Support

- ✅ Chrome/Edge 79+ (clamp support)
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Mobile browsers (iOS 13.4+, Android Chrome)

---

## Next Steps

This typography system provides the foundation for:
1. **Spacing System** (8pt grid)
2. **Component Library** (reusable UI components)
3. **Dark Mode** (color-scheme aware typography)
4. **Animation States** (focus, hover, active)

---

**Status:** ✅ Complete  
**Standard:** 2025 Industry Best Practices  
**WCAG Compliance:** AA Level
