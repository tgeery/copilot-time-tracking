import { useState } from 'react'
import './ProjectInput.css'

function ProjectInput({ onAdd }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    
    if (!trimmed) {
      setError('Project name cannot be empty')
      return
    }
    
    if (trimmed.length > 50) {
      setError('Project name must be 50 characters or less')
      return
    }

    try {
      await onAdd(trimmed)
      setInput('')
      setError('')
    } catch (err) {
      setError('Failed to add project')
      console.error(err)
    }
  }

  return (
    <div className="project-input">
      <h3>Add Project</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Project name (max 50 chars)"
          maxLength={50}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default ProjectInput
