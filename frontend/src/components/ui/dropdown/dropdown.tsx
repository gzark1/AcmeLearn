import * as React from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'

import { cn } from '@/utils/cn'

export type DropdownItem = {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  destructive?: boolean
  disabled?: boolean
}

export type DropdownProps = {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export const Dropdown = ({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownProps) => {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <MenuButton as={React.Fragment}>{trigger}</MenuButton>

      <MenuItems
        transition
        className={cn(
          'absolute z-50 mt-2 w-56 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg',
          'transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
          align === 'right' ? 'right-0' : 'left-0'
        )}
      >
        {items.map((item, index) => (
          <MenuItem key={index} disabled={item.disabled}>
            {({ focus }) => (
              <button
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm',
                  item.destructive ? 'text-red-600' : 'text-slate-700',
                  focus && (item.destructive ? 'bg-red-50' : 'bg-slate-100'),
                  item.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}

export type DropdownSeparatorProps = {
  className?: string
}

export const DropdownSeparator = ({ className }: DropdownSeparatorProps) => {
  return <div className={cn('my-1 h-px bg-slate-200', className)} />
}
