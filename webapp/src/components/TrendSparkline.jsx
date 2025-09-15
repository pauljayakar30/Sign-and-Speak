import React from 'react'

export default function TrendSparkline({ data = [], width = 280, height = 60, stroke = '#FF6B6B', fill = 'rgba(255,107,107,0.15)' }) {
  if (!data || data.length === 0) return <svg width={width} height={height} />
  const max = Math.max(1, ...data)
  const w = width
  const h = height
  const step = w / Math.max(1, data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = h - (v / max) * (h - 6) - 3
    return [x, y]
  })
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(' ')
  const area = `${path} L ${w},${h} L 0,${h} Z`
  return (
    <svg width={w} height={h} role="img" aria-label="Activity trend">
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(255,107,107,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkfill)" stroke="none" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
