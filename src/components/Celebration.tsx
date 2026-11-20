import { useEffect, useMemo } from 'react'

const COLORS = ['#4aa8ff', '#7fd1ff', '#ffd166', '#ff8fab', '#7ee081', '#b79cff']
const MESSAGES = [
  'You hit your daily goal! 🎉',
  'Goal reached. Your body says thank you! 💦',
  'Splash! Daily goal complete! 🌊',
]

/** A short confetti + message overlay. Pure CSS; reduced-motion users get just the message. */
export default function Celebration({ onDone }: { onDone: () => void }) {
  const message = useMemo(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)], [])
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        drop: i % 3 === 0,
      })),
    [],
  )

  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="celebrate" role="status" onClick={onDone}>
      <div className="confetti" aria-hidden="true">
        {pieces.map((p, i) => (
          <span
            key={i}
            className={p.drop ? 'piece drop' : 'piece'}
            style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
          />
        ))}
      </div>
      <p className="celebrate-msg">{message}</p>
    </div>
  )
}
