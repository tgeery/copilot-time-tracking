import { useState } from 'react'
import './TaskInput.css'

function TaskInput({ projects, onAdd }) {
  const [input, setInput] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    
    if (!trimmed) {
      setError('Task name cannot be empty')
      return
    }
    
    if (trimmed.length > 50) {
      setError('Task name must be 50 characters or less')
      return
    }

    try {
      await onAdd(trimmed, projectId || null)
      setInput('')
      setProjectId('')
      setError('')
    } catch (err) {
      setError('Failed to add task')
      console.error(err)
    }
  }

  return (
    <div className="task-input">
      <h3>Add Task</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Task name (max 50 chars)"
          maxLength={50}
        />
        <select 
          value={projectId} 
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">No project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default TaskInput
