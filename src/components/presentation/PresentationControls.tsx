import Icon from '../ui/Icon'

interface PresentationControlsProps { onExit: () => void; onHelp: () => void }

export default function PresentationControls({ onExit, onHelp }: PresentationControlsProps) {
  return (
    <div className="presentation-controls">
      <button type="button" onClick={onHelp}><Icon name="help" size={15} /> Guide</button>
      <button type="button" onClick={onExit}><Icon name="close" size={15} /> Exit presentation</button>
    </div>
  )
}
