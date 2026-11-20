// Drink reminders.
// Current version: works while the app is open (or installed and running in the
// background on most desktops). Reminders that arrive when the app is fully
// closed need "Web Push" with a small server — see the GitHub issue for that.

import type { Settings } from './storage'

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function askPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  return (await Notification.requestPermission()) === 'granted'
}

const MESSAGES = [
  'Time for a sip! 💧',
  'Your water misses you 🥤',
  'Hydration check — grab a glass!',
  'Little sips add up. Drink some water 🌊',
  'Stretch, breathe, drink water ✨',
]

export async function showReminder(remainingMl: number) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const title = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  const body = remainingMl > 0 ? `${remainingMl} ml to go today.` : 'Goal done — bonus sips welcome!'
  const reg = await navigator.serviceWorker?.getRegistration()
  if (reg) reg.showNotification(title, { body, icon: 'icon.svg', tag: 'drink-reminder' })
  else new Notification(title, { body, icon: 'icon.svg' })
}

export function isWithinActiveHours(s: Settings, now = new Date()) {
  const h = now.getHours()
  return h >= s.dayStartHour && h < s.dayEndHour
}

/** Starts a timer; returns a function that stops it. */
export function startReminderLoop(getState: () => { settings: Settings; remainingMl: number; lastDrinkAt: number }) {
  let lastFired = Date.now() // don't nag the moment the app opens
  const id = window.setInterval(() => {
    const { settings, remainingMl, lastDrinkAt } = getState()
    if (!settings.remindersOn || !isWithinActiveHours(settings)) return
    const since = Date.now() - Math.max(lastDrinkAt, lastFired)
    if (since >= settings.reminderEveryMin * 60_000) {
      lastFired = Date.now()
      void showReminder(remainingMl)
    }
  }, 30_000)
  return () => window.clearInterval(id)
}
