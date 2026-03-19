import type { BreathworkProtocol } from '../api/client'

type IconKind = 'wave' | 'flame' | 'infinity' | 'lotus' | 'pulse' | 'moon'

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 12c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.8-4 2.4 4 4.8 4" />
      <path d="M2 16c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.8-4 2.4 4 4.8 4" opacity="0.65" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c2 3 5 4.5 5 8.5A5 5 0 0 1 7 12c0-1.8.7-3.3 2.1-4.6C10.2 6.5 11 5 12 3Z" />
      <path d="M12 11c1.2 1.3 2 2.1 2 4a2 2 0 1 1-4 0c0-1.2.4-2.3 2-4Z" />
    </svg>
  )
}

function InfinityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.2 9.2c-1.6-1.6-4.2-1.6-5.8 0s-1.6 4.2 0 5.8 4.2 1.6 5.8 0L14.8 9.2c1.6-1.6 4.2-1.6 5.8 0s1.6 4.2 0 5.8-4.2 1.6-5.8 0L9.2 9.2Z" />
    </svg>
  )
}

function LotusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7c1.5 1.4 2.3 3.1 2.3 5 0 2.5-1.2 4.2-2.3 5-1.1-.8-2.3-2.5-2.3-5 0-1.9.8-3.6 2.3-5Z" />
      <path d="M7 10.5c1.6.8 2.8 2.1 3.4 3.8-1.1.7-2.6 1-4.2.7-2.1-.4-3.5-1.6-4.2-2.7 1-.9 2.9-2 5-1.8Z" />
      <path d="M17 10.5c-1.6.8-2.8 2.1-3.4 3.8 1.1.7 2.6 1 4.2.7 2.1-.4 3.5-1.6 4.2-2.7-1-.9-2.9-2-5-1.8Z" />
      <path d="M5 18c2.2-.8 4.5-1.2 7-1.2s4.8.4 7 1.2" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l2.2-4 3.2 8 2.4-5H22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 14.5A7.5 7.5 0 0 1 9.5 6a8.5 8.5 0 1 0 8.5 8.5Z" />
    </svg>
  )
}

export function getBreathworkIconKind(protocol: BreathworkProtocol): IconKind {
  if (protocol.id === 'nsdr' || protocol.id === '4-7-8') return 'moon'
  if (protocol.id.includes('alternate') || protocol.id.includes('box')) return 'infinity'
  if (protocol.id.includes('kapalabhati') || protocol.id.includes('bhastrika') || protocol.id.includes('tummo')) return 'flame'
  if (protocol.id.includes('wim-hof') || protocol.id.includes('soma') || protocol.id.includes('holotropic') || protocol.id.includes('shamanic')) return 'pulse'
  if (protocol.id.includes('qi-gong')) return 'lotus'
  return 'wave'
}

export default function BreathworkIcon({ protocol }: { protocol: BreathworkProtocol }) {
  const kind = getBreathworkIconKind(protocol)

  switch (kind) {
    case 'flame':
      return <FlameIcon />
    case 'infinity':
      return <InfinityIcon />
    case 'lotus':
      return <LotusIcon />
    case 'pulse':
      return <PulseIcon />
    case 'moon':
      return <MoonIcon />
    default:
      return <WaveIcon />
  }
}
