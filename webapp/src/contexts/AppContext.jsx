/**
 * AppContext - Centralized State Management
 * 
 * Replaces window events with proper React Context API
 * Provides:
 * - Stars count synchronization
 * - Avatar selection
 * - Sign detection events
 * - Camera state management
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Stars management
  const [stars, setStars] = useState(() => {
    try {
      return Number(localStorage.getItem('stars') || '0')
    } catch {
      return 0
    }
  })

  // Avatar management
  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem('avatar') || 'otter'
    } catch {
      return 'otter'
    }
  })

  // Sign detection listeners
  const [signListeners] = useState(() => new Set())

  // Update stars with localStorage sync
  const updateStars = useCallback((newStars) => {
    setStars(newStars)
    try {
      localStorage.setItem('stars', String(newStars))
    } catch (error) {
      console.error('Failed to save stars:', error)
    }
  }, [])

  // Add stars (for earning)
  const addStars = useCallback((count = 1) => {
    setStars(prev => {
      const next = prev + count
      try {
        localStorage.setItem('stars', String(next))
      } catch (error) {
        console.error('Failed to save stars:', error)
      }
      return next
    })
  }, [])

  // Update avatar with localStorage sync
  const updateAvatar = useCallback((newAvatar) => {
    setAvatar(newAvatar)
    try {
      localStorage.setItem('avatar', newAvatar)
    } catch (error) {
      console.error('Failed to save avatar:', error)
    }
  }, [])

  // Subscribe to sign detection events
  const subscribeToSigns = useCallback((callback) => {
    signListeners.add(callback)
    return () => signListeners.delete(callback)
  }, [signListeners])

  // Emit sign detection event
  const emitSignDetected = useCallback((sign, metadata = {}) => {
    signListeners.forEach(callback => {
      try {
        callback(sign, metadata)
      } catch (error) {
        console.error('Sign listener error:', error)
      }
    })
  }, [signListeners])

  // Sync stars across tabs (localStorage events)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'stars') {
        setStars(Number(e.newValue || '0'))
      } else if (e.key === 'avatar') {
        setAvatar(e.newValue || 'otter')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const value = {
    // Stars
    stars,
    updateStars,
    addStars,
    
    // Avatar
    avatar,
    updateAvatar,
    
    // Sign detection
    subscribeToSigns,
    emitSignDetected
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook for consuming context
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

// Convenience hooks for specific features
export function useStars() {
  const { stars, updateStars, addStars } = useAppContext()
  return { stars, updateStars, addStars }
}

export function useAvatar() {
  const { avatar, updateAvatar } = useAppContext()
  return { avatar, updateAvatar }
}

export function useSignDetection() {
  const { subscribeToSigns, emitSignDetected } = useAppContext()
  return { subscribeToSigns, emitSignDetected }
}
