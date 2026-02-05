import { useState } from 'react'
import './TaskList.css'

function TaskList({ tasks, projects, selectedTaskId, onSelect, onDelete, onEdit, activeTimerId }) {
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editProjectId, setEditProjectId] = useState('')

  const getProjectName = (projectId) => {
    if (!projectId) return 'No project'
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : 'Unknown'
  }

  const startEdit = (task) => {
    setEditId(task.id)
    setEditName(task.name)
    setEditProjectId(task.project_id || '')
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditName('')
    setEditProjectId('')
  }

  const handleSave = async (id) => {
    const trimmed = editName.trim()
    if (!trimmed) {
      cancelEdit()
      return
    }
    try {
      await onEdit(id, trimmed, editProjectId || null)
      cancelEdit()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  if (tasks.length === 0) {
    return <div className="task-list"><p className="empty">No tasks yet</p></div>
  }

  return (
    <div className="task-list">
      <h3>Tasks</h3>
      <div className="tasks">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`task-item ${selectedTaskId === task.id ? 'selected' : ''} ${activeTimerId ? 'has-active' : ''}`}
          >
            {editId === task.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                />
                <select 
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleSave(task.id)}>Save</button>
                <button onClick={cancelEdit} className="cancel">Cancel</button>
              </div>
            ) : (
              <>
                <div className="task-info">
                  <button 
                    className="task-name-btn"
                    onClick={() => onSelect(task.id)}
                  >
                    {task.name}
                  </button>
                  <span className="task-project">{getProjectName(task.project_id)}</span>
                </div>
                <div className="task-actions">
                  <button onClick={() => startEdit(task)} className="small">Edit</button>
                  <button onClick={() => onDelete(task.id)} className="small danger">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskList
