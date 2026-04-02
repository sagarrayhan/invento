type DateInput = string | number | Date | null | undefined

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function fromDate(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

function parseDateInput(value: DateInput): Date | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const raw = value.trim()
  if (!raw) {
    return null
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date
    }
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date
    }
    return null
  }

  const numeric = Number(raw)
  if (Number.isFinite(numeric)) {
    const date = new Date(numeric)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

export function formatDateDDMMYYYY(value: DateInput): string {
  const parsed = parseDateInput(value)
  if (!parsed) {
    return ''
  }
  return fromDate(parsed)
}

export function toDateTimestamp(value: DateInput): number {
  const parsed = parseDateInput(value)
  return parsed ? parsed.getTime() : Number.NaN
}
