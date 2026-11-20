// All reading/writing of user data goes through this file.
// Today it uses the browser's localStorage. When we add sign-in (OAuth) and a
// real database, only this file should need to change — the UI stays the same.

export type Drink = { id: string; ml: number; at: number }

export type Settings = {
  goalMl: number
  remindersOn: boolean
  reminderEveryMin: number
  dayStartHour: number // reminders only fire between these hours
  dayEndHour: number
  name: string
}

export const DEFAULT_SETTINGS: Settings = {
  goalMl: 2000,
  remindersOn: false,
  reminderEveryMin: 60,
  dayStartHour: 8,
  dayEndHour: 21,
  name: '',
}

const KEY_DRINKS = 'ht.drinks.v1'
const KEY_SETTINGS = 'ht.settings.v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked — app still works for this session */
  }
}

export const loadDrinks = () => read<Drink[]>(KEY_DRINKS, [])
export const saveDrinks = (d: Drink[]) => write(KEY_DRINKS, d)
export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEY_SETTINGS, {}) })
export const saveSettings = (s: Settings) => write(KEY_SETTINGS, s)

export function dayKey(t: number) {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function totalsByDay(drinks: Drink[]) {
  const map = new Map<string, number>()
  for (const d of drinks) map.set(dayKey(d.at), (map.get(dayKey(d.at)) ?? 0) + d.ml)
  return map
}

/** Consecutive days (ending today, or yesterday if today isn't done yet) that hit the goal. */
export function streak(drinks: Drink[], goalMl: number, now = Date.now()) {
  const totals = totalsByDay(drinks)
  const day = new Date(now)
  if ((totals.get(dayKey(day.getTime())) ?? 0) < goalMl) day.setDate(day.getDate() - 1)
  let count = 0
  while ((totals.get(dayKey(day.getTime())) ?? 0) >= goalMl) {
    count++
    day.setDate(day.getDate() - 1)
  }
  return count
}

// Remembers the last day we showed the goal celebration, so it only plays once per day.
const KEY_CELEBRATED = 'ht.celebrated.v1'
export const loadCelebratedDay = () => read<string>(KEY_CELEBRATED, '')
export const saveCelebratedDay = (day: string) => write(KEY_CELEBRATED, day)
