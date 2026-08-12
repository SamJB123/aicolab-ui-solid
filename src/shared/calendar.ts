export type YMD = { y: number; m: number; d: number }
export type YM = { y: number; m: number }

export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Weekday index (0=Sun) for a Y/M/D — timezone-stable via local-midnight. */
export const weekdayOf = (y: number, m: number, d: number) => new Date(y, m, d).getDay()
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
export const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay()

/** Full weekday name, derived from a Y/M/D. */
export const longWeekday = (y: number, m: number, d: number) =>
	['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekdayOf(y, m, d)]

export const sameDay = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d

/** Months since year 0 — the comparable form of a {y, m}. */
export const monthIndex = (v: YM) => v.y * 12 + v.m

export const addMonths = (v: YM, delta: number): YM => {
	const total = monthIndex(v) + delta
	return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 }
}

export const todayYMD = (): YMD => {
	const now = new Date()
	return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }
}

/** The 6-week grid: 42 cells, leading/trailing blanks as null. */
export const monthCells = (y: number, m: number): (number | null)[] => {
	const blanks = firstWeekday(y, m)
	const days = daysInMonth(y, m)
	return Array.from({ length: 42 }, (_, i) => {
		const d = i - blanks + 1
		return d >= 1 && d <= days ? d : null
	})
}

/** "9:05 AM" from minutes-since-midnight. */
export function fmtTime(min: number): string {
	const h = Math.floor(min / 60)
	const m = min % 60
	const ap = h < 12 ? 'AM' : 'PM'
	const h12 = ((h + 11) % 12) + 1
	return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

export function fmtRange(start: number, dur: number): string {
	if (dur === 0) return fmtTime(start)
	return `${fmtTime(start)} – ${fmtTime(start + dur)}`
}
