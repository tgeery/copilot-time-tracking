import { formatDuration } from '../utils/time'
import './TotalsReport.css'

function TotalsReport({ tasks, projects, timeEntries, activeTimerId, activeTaskId, elapsedMinutes }) {
  // Calculate totals by task
  const getTaskTotal = (taskId) => {
    let total = timeEntries
      .filter(entry => entry.task_id === taskId && entry.end_time)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)

    // Add elapsed time if this task is currently active
    if (activeTimerId && activeTaskId === taskId) {
      total += elapsedMinutes
    }

    return total
  }

  // Calculate totals by project
  const getProjectTotal = (projectId) => {
    let total = timeEntries
      .filter(entry => entry.project_id === projectId && entry.end_time)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)

    // Add elapsed time if active task is in this project
    if (activeTimerId && activeTaskId) {
      const activeTask = tasks.find(t => t.id === activeTaskId)
      if (activeTask && activeTask.project_id === projectId) {
        total += elapsedMinutes
      }
    }

    return total
  }

  // Get tasks for a project
  const getTasksForProject = (projectId) => {
    return tasks.filter(t => t.project_id === projectId)
  }

  // Get unassigned tasks total
  const getUnassignedTotal = () => {
    let total = timeEntries
      .filter(entry => !entry.project_id && entry.end_time)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)

    if (activeTimerId && activeTaskId) {
      const activeTask = tasks.find(t => t.id === activeTaskId)
      if (activeTask && !activeTask.project_id) {
        total += elapsedMinutes
      }
    }

    return total
  }

  const projectsWithTasks = projects.filter(p => getTasksForProject(p.id).length > 0)
  const unassignedTasks = tasks.filter(t => !t.project_id)
  const hasUnassigned = unassignedTasks.some(t => getTaskTotal(t.id) > 0)

  return (
    <div className="totals-report">
      <div className="report-section">
        <h3>By Task</h3>
        <div className="report-items">
          {tasks.length === 0 ? (
            <p className="empty">No tasks yet</p>
          ) : tasks.some(t => getTaskTotal(t.id) > 0) ? (
            tasks
              .filter(t => getTaskTotal(t.id) > 0)
              .map(task => (
                <div key={task.id} className="report-item">
                  <span className="item-name">{task.name}</span>
                  <span className="item-value">{formatDuration(getTaskTotal(task.id))}</span>
                </div>
              ))
          ) : (
            <p className="empty">No time tracked</p>
          )}
        </div>
      </div>

      <div className="report-section">
        <h3>By Project</h3>
        <div className="report-items">
          {projects.length === 0 && unassignedTasks.length === 0 ? (
            <p className="empty">No projects yet</p>
          ) : (
            <>
              {projectsWithTasks.map(project => {
                const total = getProjectTotal(project.id)
                return total > 0 ? (
                  <div key={project.id} className="report-item">
                    <span className="item-name">{project.name}</span>
                    <span className="item-value">{formatDuration(total)}</span>
                  </div>
                ) : null
              })}
              {hasUnassigned && (
                <div className="report-item">
                  <span className="item-name">Unassigned</span>
                  <span className="item-value">{formatDuration(getUnassignedTotal())}</span>
                </div>
              )}
              {!projectsWithTasks.some(p => getProjectTotal(p.id) > 0) && !hasUnassigned && (
                <p className="empty">No time tracked</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="report-section">
        <h3>By Task per Project</h3>
        <div className="report-items">
          {projects.length === 0 && unassignedTasks.length === 0 ? (
            <p className="empty">No projects yet</p>
          ) : (
            <>
              {projectsWithTasks.map(project => (
                <div key={project.id} className="project-group">
                  <div className="project-header">{project.name}</div>
                  {getTasksForProject(project.id).map(task => {
                    const total = getTaskTotal(task.id)
                    return total > 0 ? (
                      <div key={task.id} className="report-item sub">
                        <span className="item-name">  {task.name}</span>
                        <span className="item-value">{formatDuration(total)}</span>
                      </div>
                    ) : null
                  })}
                </div>
              ))}
              {hasUnassigned && (
                <div className="project-group">
                  <div className="project-header">Unassigned</div>
                  {unassignedTasks.map(task => {
                    const total = getTaskTotal(task.id)
                    return total > 0 ? (
                      <div key={task.id} className="report-item sub">
                        <span className="item-name">  {task.name}</span>
                        <span className="item-value">{formatDuration(total)}</span>
                      </div>
                    ) : null
                  })}
                </div>
              )}
              {!projectsWithTasks.some(p => 
                getTasksForProject(p.id).some(t => getTaskTotal(t.id) > 0)
              ) && !hasUnassigned && (
                <p className="empty">No time tracked</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TotalsReport
