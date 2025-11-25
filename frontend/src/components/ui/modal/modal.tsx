import * as React from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

import { cn } from '@/utils/cn'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: keyof typeof sizes
  className?: string
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={cn(
              'w-full transform rounded-2xl bg-white p-6 shadow-xl transition-all duration-200',
              'data-[closed]:scale-95 data-[closed]:opacity-0',
              sizes[size],
              className
            )}
          >
            {title && (
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {title}
              </DialogTitle>
            )}

            {description && (
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            )}

            <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>

            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm p-1 text-slate-400 transition-colors hover:text-slate-600"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export type ModalFooterProps = {
  children: React.ReactNode
  className?: string
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
    >
      {children}
    </div>
  )
}
