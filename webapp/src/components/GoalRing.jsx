import React from 'react'

export default function GoalRing({ value = 0, goal = 10, size = 96, stroke = 10, color = '#FFD166', bg = '#ffe7cc' }) {
  const v = Math.max(0, Math.min(goal, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = v / goal
  const dash = circumference * pct
  const rest = circumference - dash
  return (
    <svg width={size} height={size} role="img" aria-label={`Progress ${v} of ${goal}`}>
      <g transform={`translate(${size/2}, ${size/2})`}>
        <circle r={radius} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${rest}`} strokeLinecap="round" transform="rotate(-90)" />
        <text textAnchor="middle" dominantBaseline="middle" fontWeight="800" fontSize={18} fill="#0b1f3b">{v}/{goal}</text>
      </g>
    </svg>
  )
}
