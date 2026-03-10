'use client'

import { useMemo, useState, useTransition } from 'react'
import { updateBusinessAvailabilities } from '@/lib/actions'

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

interface AvailabilityDay {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  isActive: boolean
}

interface AvailabilityClientProps {
  businessId: string
  businessName: string
  initialAvailability: AvailabilityDay[]
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7',
  SUNDAY: 'Chủ nhật',
}

export default function AvailabilityClient({
  businessId,
  businessName,
  initialAvailability,
}: AvailabilityClientProps) {
  const [rows, setRows] = useState<AvailabilityDay[]>(initialAvailability)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  const mondayRow = useMemo(
    () => rows.find((row) => row.dayOfWeek === 'MONDAY'),
    [rows]
  )

  const updateRow = (
    day: DayOfWeek,
    patch: Partial<Pick<AvailabilityDay, 'isActive' | 'startTime' | 'endTime'>>
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.dayOfWeek === day
          ? {
              ...row,
              ...patch,
            }
          : row
      )
    )
  }

  const applyMondayToAllDays = () => {
    if (!mondayRow) {
      return
    }

    setRows((prev) =>
      prev.map((row) =>
        row.dayOfWeek === 'MONDAY'
          ? row
          : {
              ...row,
              isActive: mondayRow.isActive,
              startTime: mondayRow.startTime,
              endTime: mondayRow.endTime,
            }
      )
    )
  }

  const validateRows = (items: AvailabilityDay[]) => {
    for (const row of items) {
      if (!row.isActive) {
        continue
      }

      if (!row.startTime || !row.endTime) {
        throw new Error(`Vui lòng chọn giờ cho ${DAY_LABELS[row.dayOfWeek]}`)
      }

      if (row.startTime >= row.endTime) {
        throw new Error(`Giờ kết thúc phải sau giờ bắt đầu (${DAY_LABELS[row.dayOfWeek]})`)
      }
    }
  }

  const onSaveChanges = () => {
    setMessage('')
    setError('')

    startTransition(async () => {
      try {
        validateRows(rows)
        const result = await updateBusinessAvailabilities(businessId, rows)

        if (!result.success) {
          throw new Error(result.error || 'Không thể lưu thay đổi')
        }

        setMessage('Đã lưu thay đổi thành công.')
      } catch (saveError) {
        setError((saveError as Error).message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Giờ mở cửa</h1>
          <p className="mt-1 text-slate-600">{businessName}</p>
        </div>

        <button
          type="button"
          onClick={applyMondayToAllDays}
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Áp dụng cho tất cả các ngày
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.dayOfWeek} className="grid gap-3 p-4 md:grid-cols-12 md:items-center">
              <div className="md:col-span-3">
                <p className="font-semibold text-slate-900">{DAY_LABELS[row.dayOfWeek]}</p>
              </div>

              <div className="md:col-span-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.isActive}
                  onClick={() => updateRow(row.dayOfWeek, { isActive: !row.isActive })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                    row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      row.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm text-slate-600">
                  {row.isActive ? 'Mở cửa' : 'Đóng cửa'}
                </span>
              </div>

              {row.isActive ? (
                <>
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-xs text-slate-500">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={row.startTime}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, { startTime: event.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-200 transition focus:ring-2"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-xs text-slate-500">Giờ kết thúc</label>
                    <input
                      type="time"
                      value={row.endTime}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, { endTime: event.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-200 transition focus:ring-2"
                    />
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400 md:col-span-6">Không hoạt động</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSaveChanges}
          disabled={isPending}
          className="inline-flex min-w-40 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
