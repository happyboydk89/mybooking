'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { sendBookingReminder, updateBookingStatus } from '@/lib/actions'

export interface BookingRow {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  dateTimeLabel: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  payment: 'PAID' | 'UNPAID'
}

interface BookingDataTableProps {
  initialRows: BookingRow[]
}

const statusBadgeClasses: Record<BookingRow['status'], string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
}

function RowActions({
  row,
  onConfirm,
  onCancel,
  onSendReminder,
  pending,
}: {
  row: BookingRow
  onConfirm: (bookingId: string) => void
  onCancel: (bookingId: string) => void
  onSendReminder: (bookingId: string) => void
  pending: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-flex justify-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            disabled={pending || row.status === 'CONFIRMED'}
            onClick={() => {
              setOpen(false)
              onConfirm(row.id)
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận lịch
          </button>
          <button
            type="button"
            disabled={pending || row.status === 'CANCELLED'}
            onClick={() => {
              setOpen(false)
              onCancel(row.id)
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy lịch
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setOpen(false)
              onSendReminder(row.id)
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gửi email nhắc lịch
          </button>
        </div>
      )}
    </div>
  )
}

export default function BookingDataTable({ initialRows }: BookingDataTableProps) {
  const [rows, setRows] = useState<BookingRow[]>(initialRows)
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingRow['status']>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchedStatus = statusFilter === 'ALL' || row.status === statusFilter
      const normalized = searchTerm.trim().toLowerCase()
      const matchedSearch =
        normalized.length === 0 ||
        row.customerName.toLowerCase().includes(normalized) ||
        row.customerEmail.toLowerCase().includes(normalized)

      return matchedStatus && matchedSearch
    })
  }, [rows, searchTerm, statusFilter])

  const updateRowStatusOptimistic = (bookingId: string, status: BookingRow['status']) => {
    setRows((prev) => prev.map((row) => (row.id === bookingId ? { ...row, status } : row)))
  }

  const handleConfirm = (bookingId: string) => {
    updateRowStatusOptimistic(bookingId, 'CONFIRMED')

    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, 'CONFIRMED')
      if (!result.success) {
        setRows((prev) =>
          prev.map((row) =>
            row.id === bookingId ? { ...row, status: 'PENDING' } : row
          )
        )
        setFeedback(result.error || 'Không thể xác nhận lịch.')
        return
      }

      setFeedback('Đã xác nhận lịch hẹn.')
    })
  }

  const handleCancel = (bookingId: string) => {
    const previous = rows.find((row) => row.id === bookingId)?.status || 'PENDING'
    updateRowStatusOptimistic(bookingId, 'CANCELLED')

    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, 'CANCELLED')
      if (!result.success) {
        setRows((prev) =>
          prev.map((row) =>
            row.id === bookingId ? { ...row, status: previous } : row
          )
        )
        setFeedback(result.error || 'Không thể hủy lịch.')
        return
      }

      setFeedback('Đã hủy lịch hẹn.')
    })
  }

  const handleSendReminder = (bookingId: string) => {
    startTransition(async () => {
      const result = await sendBookingReminder(bookingId)
      if (!result.success) {
        setFeedback(result.error || 'Không thể gửi email nhắc lịch.')
        return
      }

      setFeedback('Đã gửi email nhắc lịch thành công.')
    })
  }

  const columns = useMemo<ColumnDef<BookingRow>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Khách hàng',
        cell: ({ row }) => {
          const data = row.original
          const initials = (data.customerName || data.customerEmail)
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{data.customerName || data.customerEmail}</p>
                <p className="truncate text-xs text-slate-500">{data.customerEmail}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'serviceName',
        header: 'Dịch vụ',
      },
      {
        accessorKey: 'dateTimeLabel',
        header: 'Ngày & Giờ',
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[row.original.status]}`}
          >
            {row.original.status === 'CONFIRMED'
              ? 'Confirmed'
              : row.original.status === 'PENDING'
                ? 'Pending'
                : 'Cancelled'}
          </span>
        ),
      },
      {
        accessorKey: 'payment',
        header: 'Thanh toán',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
              row.original.payment === 'PAID'
                ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {row.original.payment === 'PAID' ? 'Paid' : 'Unpaid'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            pending={isPending}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onSendReminder={handleSendReminder}
          />
        ),
      },
    ],
    [isPending]
  )

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tên khách..."
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-indigo-200 transition focus:ring-2 sm:w-72"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | BookingRow['status'])}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-indigo-200 transition focus:ring-2"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isPending && <span className="text-sm text-slate-500">Đang cập nhật...</span>}
      </div>

      {feedback && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          {feedback}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  Không có lịch hẹn phù hợp bộ lọc.
                </td>
              </tr>
            )}

            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
