import React from 'react'
import { EmptyStickers } from './EmptyState'

export default function StickerBook({ stars = 0, max = 10, onStartPractice }) {
  // Show empty state only if no stars at all
  if (stars === 0) {
    return (
      <div className="sticker-book-empty">
        <EmptyStickers onStartPractice={onStartPractice} />
      </div>
    )
  }
  
  const arr = new Array(max).fill(0).map((_, i) => i < Math.min(stars, max))
  return (
    <div className="sticker-book" aria-label={`Sticker book: ${stars} stars`}>
      {arr.map((filled, i) => (
        <div key={i} className={`sticker ${filled ? 'filled' : ''}`} aria-hidden={!filled}>
          {filled ? '⭐' : '✦'}
        </div>
      ))}
    </div>
  )
}
