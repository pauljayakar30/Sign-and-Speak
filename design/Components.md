# Component Library Spec

## Child Components
- BigIconButton: large pictorial button with bounce on press; label optional; sound cue.
- AdventureCard: gradient card with mascot, short prompt.
- RewardBadge: animated badge (Lottie), confetti trigger.
- JourneyMap: simple path with nodes; completed nodes glow.
- Sticker: draggable collectible; StickerBook grid.
- CameraPanel: mirrored video, large feedback pill, mascot tip bubble.

## Parent Components
- KPICard: headline number + sparkline + trend delta.
- TrendChart: 4-week area chart; accessible SVG with descriptions.
- ActivityList: grouped feed with icons (sign, mood), readable timestamps.
- InsightsCard: 2–3 tips, link to resource.
- PlanCard: Daily/Weekly/Story quick access.

## States & A11y
- All interactive elements: :focus-visible ring, ARIA labels.
- Keyboard navigation order logical; skip links in parent app.
- Provide alt text for images; mascot speech also as text.
