export type IconName =
  | 'help' | 'fullscreen' | 'presentation' | 'menu' | 'close'
  | 'camera' | 'hand' | 'reset' | 'eye' | 'eyeOff'
  | 'palette'
  | 'sphere' | 'galaxy' | 'heart' | 'spiral' | 'wave'
  | 'burst' | 'implosion' | 'vortex'

interface IconProps {
  name: IconName
  size?: number
}

function IconPaths({ name }: { name: IconName }) {
  if (name === 'help') return <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 0 1 4.7.7c0 1.8-2.5 2-2.5 3.8M12 17h.01" /></>
  if (name === 'fullscreen') return <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></>
  if (name === 'presentation') return <><rect x="3" y="4" width="18" height="13" rx="1" /><path d="m8 21 4-4 4 4" /></>
  if (name === 'menu') return <path d="M4 7h16M4 12h16M4 17h16" />
  if (name === 'close') return <path d="m6 6 12 12M18 6 6 18" />
  if (name === 'camera') return <><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="3.5" /><path d="m8 6 1.5-2h5L16 6" /></>
  if (name === 'palette') return <><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5c0-3-4-5-9-5Z" /><circle cx="7.5" cy="9" r=".7" fill="currentColor" /><circle cx="10" cy="6.5" r=".7" fill="currentColor" /><circle cx="15" cy="7" r=".7" fill="currentColor" /></>
  if (name === 'hand') return <path d="M7 12V7a1.5 1.5 0 0 1 3 0v3-5a1.5 1.5 0 0 1 3 0v5-4a1.5 1.5 0 0 1 3 0v5-2a1.5 1.5 0 0 1 3 0v5c0 4-2.5 7-7 7-3.5 0-5.5-2-7.5-5a1.5 1.5 0 0 1 2.5-1.7L9 16" />
  if (name === 'reset') return <><path d="M4 4v6h6" /><path d="M5.5 15a8 8 0 1 0 .8-7.8L4 10" /></>
  if (name === 'eye' || name === 'eyeOff') return <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />{name === 'eyeOff' && <path d="m4 4 16 16" />}</>
  if (name === 'heart') return <path d="M12 20S4 15.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.5 12 20 12 20Z" />
  if (name === 'wave') return <path d="M3 12c2.3-6 4.7 6 7 0s4.7 6 7 0 4 0 4 0" />
  if (name === 'burst') return <><path d="m12 2 1.5 6L19 5l-3 5.5 6 1.5-6 1.5 3 5.5-5.5-3L12 22l-1.5-6L5 19l3-5.5L2 12l6-1.5L5 5l5.5 3Z" /></>
  if (name === 'implosion') return <><circle cx="12" cy="12" r="2" /><path d="M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6" /></>
  if (name === 'galaxy') return <><circle cx="12" cy="12" r="1.5" /><path d="M4 15c3 4 11 3 14-1 2-3 0-7-4-8M20 9c-3-4-11-3-14 1-2 3 0 7 4 8" /></>
  if (name === 'spiral') return <path d="M12 12c2-2 5 1 3 3-3 3-8 0-7-4 1-5 9-6 12-1 3 6-3 12-10 10" />
  if (name === 'vortex') return <><path d="M5 5h14M7 9h10M9 13h6M10.5 17h3M12 17v4" /></>
  return <><circle cx="12" cy="12" r="8" /><ellipse cx="12" cy="12" rx="8" ry="3" /><path d="M12 4c3 3 3 13 0 16" /></>
}

export default function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      className="ui-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <IconPaths name={name} />
    </svg>
  )
}
