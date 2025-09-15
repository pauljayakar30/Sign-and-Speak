import React from 'react'

export default function StickerBook({ stars = 0, max = 10 }) {
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
