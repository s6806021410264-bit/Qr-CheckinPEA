

import { useState, useCallback } from 'react'

let _toastId = 0

export const TOAST_ICON = { success: '✓', error: '✕', info: 'ℹ' }
export const TOAST_DURATION = 3500

/**
 * @returns {{ toasts: Array, toast: Function }}
 *   toast(msg, type) — type: 'success' | 'error' | 'info'
 */
export function useToasts() {
       const [toasts, setToasts] = useState([])

       const toast = useCallback((msg, type = 'info') => {
              const id = ++_toastId
              setToasts(prev => [...prev, { id, msg, type }])
              setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), TOAST_DURATION)
       }, [])

       return { toasts, toast }
}
