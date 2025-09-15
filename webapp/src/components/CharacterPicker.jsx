import React from 'react'

const choices = [
  { id: 'otter', label: 'Otter', emoji: '🦦' },
  { id: 'panda', label: 'Panda', emoji: '🐼' },
  { id: 'fox', label: 'Fox', emoji: '🦊' },
  { id: 'dino', label: 'Dino', emoji: '🦕' }
]

export default function CharacterPicker({ value, onChange }) {
  return (
    <div className="char-picker" role="listbox" aria-label="Choose your character">
      {choices.map(c => (
        <button key={c.id} className={`char ${value === c.id ? 'active' : ''}`} role="option" aria-selected={value === c.id} onClick={() => onChange(c.id)}>
          <span className="char-emoji" aria-hidden>{c.emoji}</span>
          <span className="char-label">{c.label}</span>
        </button>
      ))}
    </div>
  )
}
