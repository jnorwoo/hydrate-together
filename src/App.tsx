import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  type Drink,
  type Settings,
  dayKey,
  loadDrinks,
  loadSettings,
  saveDrinks,
  saveSettings,
  streak,
  totalsByDay,
} from './storage'
import { askPermission, notificationsSupported, showReminder, startReminderLoop } from './reminders'

const QUICK_ADD = [
  { label: 'Sip', ml: 100, emoji: '💧' },
  { label: 'Glass', ml: 250, emoji: '🥛' },
  { label: 'Bottle', ml: 500, emoji: '🍶' },
]

export default function App() {
  const [drinks, setDrinks] = useState<Drink[]>(loadDrinks)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [custom, setCustom] = useState('')

  useEffect(() => saveDrinks(drinks), [drinks])
  useEffect(() => saveSettings(settings), [settings])

  const today = dayKey(Date.now())
  const todays = useMemo(() => drinks.filter((d) => dayKey(d.at) === today).sort((a, b) => b.at - a.at), [drinks, today])
  const total = todays.reduce((s, d) => s + d.ml, 0)
  const pct = Math.min(100, Math.round((total / settings.goalMl) * 100))
  const remaining = Math.max(0, settings.goalMl - total)
  const currentStreak = streak(drinks, settings.goalMl)

  // Reminder loop reads the latest state through a ref so it isn't restarted on every drink.
  const lastDrinkAt = drinks.reduce((m, d) => Math.max(m, d.at), 0)
  const stateRef = useRef({ settings, remainingMl: remaining, lastDrinkAt })
  useEffect(() => {
    stateRef.current = { settings, remainingMl: remaining, lastDrinkAt }
  }, [settings, remaining, lastDrinkAt])
  useEffect(() => startReminderLoop(() => stateRef.current), [])

  function add(ml: number) {
    if (!ml || ml <= 0) return
    setDrinks((prev) => [...prev, { id: crypto.randomUUID(), ml, at: Date.now() }])
  }
  function remove(id: string) {
    setDrinks((prev) => prev.filter((d) => d.id !== id))
  }

  async function toggleReminders(on: boolean) {
    if (on && !(await askPermission())) {
      alert('Notifications are blocked. Turn them on for this site in your browser settings, then try again.')
      return
    }
    setSettings((s) => ({ ...s, remindersOn: on }))
  }

  const week = useMemo(() => {
    const totals = totalsByDay(drinks)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return { label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), ml: totals.get(dayKey(d.getTime())) ?? 0 }
    })
  }, [drinks])

  return (
    <main className="app">
      <header className="top">
        <div>
          <p className="hello">{settings.name ? `Hi ${settings.name}!` : 'Hi there!'}</p>
          <h1>Hydrate Together</h1>
        </div>
        <button className="icon-btn" aria-label="Settings" onClick={() => setShowSettings((v) => !v)}>
          ⚙️
        </button>
      </header>

      {showSettings && (
        <section className="card settings">
          <label>
            Your name
            <input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} placeholder="Optional" />
          </label>
          <label>
            Daily goal (ml)
            <input
              type="number"
              min={500}
              step={100}
              value={settings.goalMl}
              onChange={(e) => setSettings({ ...settings, goalMl: Math.max(100, Number(e.target.value) || 0) })}
            />
          </label>
          <label className="row">
            <input type="checkbox" checked={settings.remindersOn} onChange={(e) => toggleReminders(e.target.checked)} />
            Remind me to drink
          </label>
          {!notificationsSupported() && <p className="muted">This browser doesn't support notifications.</p>}
          <label>
            Remind every
            <select
              value={settings.reminderEveryMin}
              onChange={(e) => setSettings({ ...settings, reminderEveryMin: Number(e.target.value) })}
            >
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m < 60 ? `${m} minutes` : `${m / 60} hour${m > 60 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </label>
          <div className="row two">
            <label>
              From
              <input type="number" min={0} max={23} value={settings.dayStartHour} onChange={(e) => setSettings({ ...settings, dayStartHour: Number(e.target.value) })} />
            </label>
            <label>
              Until
              <input type="number" min={1} max={24} value={settings.dayEndHour} onChange={(e) => setSettings({ ...settings, dayEndHour: Number(e.target.value) })} />
            </label>
          </div>
          {settings.remindersOn && (
            <button className="link" onClick={() => showReminder(remaining)}>
              Send a test reminder
            </button>
          )}
        </section>
      )}

      <section className="card progress">
        <div className="ring" style={{ ['--pct' as string]: pct }}>
          <div className="ring-inner">
            <strong>{total}</strong>
            <span>of {settings.goalMl} ml</span>
          </div>
        </div>
        <p className="status">
          {pct >= 100 ? 'Goal reached — amazing! 🎉' : `${remaining} ml to go`}
          {currentStreak > 0 && <span className="streak"> · 🔥 {currentStreak} day streak</span>}
        </p>
      </section>

      <section className="quick">
        {QUICK_ADD.map((q) => (
          <button key={q.ml} className="add" onClick={() => add(q.ml)}>
            <span className="emoji">{q.emoji}</span>
            <span>{q.label}</span>
            <small>{q.ml} ml</small>
          </button>
        ))}
      </section>
      <form
        className="custom"
        onSubmit={(e) => {
          e.preventDefault()
          add(Number(custom))
          setCustom('')
        }}
      >
        <input type="number" min={1} placeholder="Other amount (ml)" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <section className="card">
        <h2>This week</h2>
        <div className="bars">
          {week.map((d, i) => (
            <div key={i} className="bar-col" title={`${d.ml} ml`}>
              <div className="bar" style={{ height: `${Math.min(100, (d.ml / settings.goalMl) * 100)}%` }} data-done={d.ml >= settings.goalMl} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Today</h2>
        {todays.length === 0 ? (
          <p className="muted">No drinks yet. Tap a button above to log one!</p>
        ) : (
          <ul className="log">
            {todays.map((d) => (
              <li key={d.id}>
                <span>{new Date(d.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                <span>{d.ml} ml</span>
                <button className="link" aria-label="Remove" onClick={() => remove(d.id)}>
                  undo
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
