# React Handoff & Build Plan

## Tech Choices
- React + Vite (SPA)
- Framer Motion for micro-interactions; Lottie for reward animations
- Recharts/Victory or Visx for charts (parent)
- React Aria/Headless UI for accessible primitives

## Structure
- apps/
  - child/ (routes: login, home, module, stickers)
  - parent/ (routes: login, dashboard, progress, activity, resources, plans)
- packages/ui (shared components + tokens)

## Mapping Components
- BigIconButton → <BigIconButton /> (variants, size, icon)
- CameraPanel → <CameraPanel mirrored on>
- KPICard, TrendChart, ActivityList, InsightsCard, PlanCard

## A11y
- Focus management per route change; skip links; aria-live for updates.
- Prefers-reduced-motion handling via a hook + CSS.

## Phased Migration
1) Set up React shell; port existing endpoints/fetch; keep server.
2) Implement Parent dashboard; wire to pairing feed endpoints.
3) Implement Child flows; wrap existing MediaPipe logic in a component.
4) Add motion + rewards; polish accessibility.
