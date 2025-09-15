# Accessibility Checklist (WCAG 2.1 AA)

## Perceivable
- Text contrast ≥ 4.5:1; large text ≥ 3:1.
- Provide High Contrast mode toggle; persist preference.
- Provide text alternatives for all non-text content.

## Operable
- All actions keyboard accessible; logical tab order.
- Touch targets ≥ 44x44px.
- No time limits; avoid countdowns for children.
- Skip link for parent dashboard.

## Understandable
- Plain language; avoid jargon.
- Consistent navigation patterns.
- Visible labels for parent forms; aria-labels for icon-only child buttons.

## Robust
- Semantic HTML; ARIA where necessary.
- Test with screen readers (NVDA/VoiceOver/TalkBack).
- Respect prefers-reduced-motion; provide reduced-audio.
