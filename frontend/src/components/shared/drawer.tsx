'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  position?: 'right' | 'bottom'
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
  className?: string
  // Optional backdrop top offset (e.g. to leave header clickable if needed, but standard drawers usually cover screen)
  backdropTopOffset?: string
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  children,
  showCloseButton = true,
  className = '',
  backdropTopOffset
}: DrawerProps) {
  const [mounted, setMounted] = useState(false)

  // Hydration safeguard
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape key and prevent body scroll when open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  const isRight = position === 'right'
  const isBottom = position === 'bottom'

  // Backdrop classes
  const backdropClasses = `fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  } ${isBottom ? 'md:hidden' : ''}`

  // Apply custom backdrop offset if provided (e.g., top-16)
  const backdropStyle = backdropTopOffset && isOpen ? { top: backdropTopOffset } : {}

  // Panel classes
  let panelClasses = `fixed bg-white shadow-premium flex flex-col z-50 transition-all duration-300 ease-in-out ${className}`
  
  if (isRight) {
    panelClasses += ` inset-y-0 right-0 max-w-md w-full transform ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`
  } else if (isBottom) {
    panelClasses += ` inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh] overflow-y-auto transform md:hidden ${
      isOpen ? 'translate-y-0' : 'translate-y-full'
    }`
  }

  return (
    <>
      {/* Drawer Scrim Backdrop */}
      <div className={backdropClasses} style={backdropStyle} onClick={onClose} />

      {/* Drawer Content Panel */}
      <div className={panelClasses}>
        {/* Header (optional if title is present or close button is active) */}
        {(title || showCloseButton) && (
          <div className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 ${isBottom ? 'mt-4' : ''}`}>
            {title ? (
              <h2 className="font-heading font-black text-slate-900 text-base uppercase tracking-wider">
                {title}
              </h2>
            ) : (
              <div />
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Drawer body content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </>
  )
}
