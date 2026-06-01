'use client'

import { useEffect } from 'react'

/**
 * A custom React hook to lock body and documentElement scroll when a drawer,
 * modal, or dialog overlay is active.
 */
export function useBodyScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [lock])
}
