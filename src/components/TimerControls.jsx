import './TimerControls.css'

function TimerControls({ hasActiveTimer, isPaused, onStart, onStop, onPause, onResume }) {
  return (
    <div className="timer-controls">
      {!hasActiveTimer ? (
        <button onClick={onStart} className="primary">Start Timer</button>
      ) : (
        <>
          {!isPaused ? (
            <button onClick={onPause} className="warning">Pause</button>
          ) : (
            <button onClick={onResume} className="success">Resume</button>
          )}
          <button onClick={onStop} className="danger">Stop</button>
        </>
      )}
    </div>
  )
}

export default TimerControls
