import * as React from 'react'

import { cn } from '@/utils/cn'

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    )
  }
)
Table.displayName = 'Table'

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('bg-slate-50 [&_tr]:border-b', className)}
        {...props}
      />
    )
  }
)
TableHeader.displayName = 'TableHeader'

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      />
    )
  }
)
TableBody.displayName = 'TableBody'

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={cn('border-t bg-slate-50 font-medium', className)}
        {...props}
      />
    )
  }
)
TableFooter.displayName = 'TableFooter'

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-slate-100 transition-colors hover:bg-slate-50',
          className
        )}
        {...props}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-semibold text-slate-700',
          '[&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    )
  }
)
TableHead.displayName = 'TableHead'

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-4 align-middle text-slate-600',
          '[&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    )
  }
)
TableCell.displayName = 'TableCell'

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <caption
        ref={ref}
        className={cn('mt-4 text-sm text-slate-500', className)}
        {...props}
      />
    )
  }
)
TableCaption.displayName = 'TableCaption'
