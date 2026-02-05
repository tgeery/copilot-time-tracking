import { useState } from 'react'
import './ProjectList.css'

function ProjectList({ projects, onDelete, onEdit }) {
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')

  const startEdit = (project) => {
    setEditId(project.id)
    setEditName(project.name)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditName('')
  }

  const handleSave = async (id) => {
    const trimmed = editName.trim()
    if (!trimmed) {
      cancelEdit()
      return
    }
    try {
      await onEdit(id, trimmed)
      setEditId(null)
      setEditName('')
    } catch (err) {
      console.error('Failed to update project:', err)
    }
  }

  if (projects.length === 0) {
    return <div className="project-list"><p className="empty">No projects yet</p></div>
  }

  return (
    <div className="project-list">
      <h3>Projects</h3>
      <div className="projects">
        {projects.map((project) => (
          <div key={project.id} className="project-item">
            {editId === project.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                />
                <button onClick={() => handleSave(project.id)}>Save</button>
                <button onClick={cancelEdit} className="cancel">Cancel</button>
              </div>
            ) : (
              <>
                <span className="project-name">{project.name}</span>
                <div className="project-actions">
                  <button onClick={() => startEdit(project)} className="small">Edit</button>
                  <button onClick={() => onDelete(project.id)} className="small danger">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectList
