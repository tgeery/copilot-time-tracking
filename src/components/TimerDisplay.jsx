import { formatElapsedTime } from '../utils/time'
import './TimerDisplay.css'

function TimerDisplay({ activeTask, elapsedMinutes, isPaused }) {
  if (!activeTask) {
    return (
      <div className="timer-display empty">
        <p className="timer-label">No task running</p>
      </div>
    )
  }

  return (
    <div className="timer-display active">
      <p className="timer-label">Currently tracking:</p>
      <p className="timer-task-name">{activeTask.name}</p>
      <div className={`timer-value ${isPaused ? 'paused' : ''}`}>
        {formatElapsedTime(elapsedMinutes)}
        {isPaused && <span className="paused-badge">PAUSED</span>}
      </div>
    </div>
  )
}

export default TimerDisplay
