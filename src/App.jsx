import { useState, useEffect } from 'react'
import { initDB, getProjectsForToday, getTasksForToday, getTimeEntriesForToday, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, addTimeEntry, updateTimeEntry } from './utils/db'
import { getTodayDateString, getCurrentTime, calculateElapsedMinutes } from './utils/time'
import ProjectInput from './components/ProjectInput'
import ProjectList from './components/ProjectList'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import TimerDisplay from './components/TimerDisplay'
import TimerControls from './components/TimerControls'
import TotalsReport from './components/TotalsReport'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState(getTodayDateString())
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [activeTimerId, setActiveTimerId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [pausedElapsed, setPausedElapsed] = useState(0)

  // Initialize database and load today's data
  useEffect(() => {
    const init = async () => {
      try {
        await initDB()
        await loadTodayData()
      } catch (error) {
        console.error('Failed to initialize database:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // Timer interval
  useEffect(() => {
    if (!activeTimerId || isPaused) return

    const interval = setInterval(() => {
      const activeEntry = timeEntries.find(e => e.id === activeTimerId)
      if (activeEntry && !activeEntry.end_time) {
        const elapsed = calculateElapsedMinutes(activeEntry.start_time)
        setElapsedMinutes(elapsed + pausedElapsed)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimerId, isPaused, timeEntries, pausedElapsed])

  const loadTodayData = async () => {
    try {
      const [projectsData, tasksData, entriesData] = await Promise.all([
        getProjectsForToday(today),
        getTasksForToday(today),
        getTimeEntriesForToday(today)
      ])
      setProjects(projectsData)
      setTasks(tasksData)
      setTimeEntries(entriesData)

      // Restore active timer if there is one
      const runningEntry = entriesData.find(e => !e.end_time)
      if (runningEntry) {
        setActiveTimerId(runningEntry.id)
        setSelectedTaskId(runningEntry.task_id)
        setElapsedMinutes(calculateElapsedMinutes(runningEntry.start_time))
      }
    } catch (error) {
      console.error('Failed to load today data:', error)
    }
  }

  const handleAddProject = async (name) => {
    const newProject = await addProject(name, today)
    setProjects([...projects, newProject])
  }

  const handleEditProject = async (id, name) => {
    const updated = await updateProject(id, name)
    setProjects(projects.map(p => p.id === id ? updated : p))
  }

  const handleDeleteProject = async (id) => {
    await deleteProject(id)
    setProjects(projects.filter(p => p.id !== id))
  }

  const handleAddTask = async (name, projectId) => {
    const newTask = await addTask(name, today, projectId)
    setTasks([...tasks, newTask])
  }

  const handleEditTask = async (id, name, projectId) => {
    const updated = await updateTask(id, name, projectId)
    setTasks(tasks.map(t => t.id === id ? updated : t))
  }

  const handleDeleteTask = async (id) => {
    // Prevent deleting if task has active timer
    if (selectedTaskId === id && activeTimerId) {
      alert('Cannot delete task with active timer. Stop the timer first.')
      return
    }
    await deleteTask(id)
    setTasks(tasks.filter(t => t.id !== id))
    if (selectedTaskId === id) {
      setSelectedTaskId(null)
    }
  }

  const handleSelectTask = async (taskId) => {
    // If there's an active timer on a different task, stop it first
    if (activeTimerId && selectedTaskId !== taskId) {
      const currentEntry = timeEntries.find(e => e.id === activeTimerId)
      if (currentEntry) {
        const endTime = getCurrentTime()
        await updateTimeEntry(activeTimerId, endTime)
        
        // Add new entry for the new task
        const selectedTask = tasks.find(t => t.id === taskId)
        const newEntry = await addTimeEntry(taskId, selectedTask.project_id, today, getCurrentTime())
        
        setTimeEntries([...timeEntries.filter(e => e.id !== activeTimerId), { ...currentEntry, end_time: endTime, duration_minutes: calculateElapsedMinutes(currentEntry.start_time) }, newEntry])
        setActiveTimerId(newEntry.id)
        setSelectedTaskId(taskId)
        setIsPaused(false)
        setElapsedMinutes(0)
        setPausedElapsed(0)
      }
    } else {
      setSelectedTaskId(taskId)
    }
  }

  const handleStartTimer = async () => {
    if (!selectedTaskId) {
      alert('Please select a task first')
      return
    }

    const selectedTask = tasks.find(t => t.id === selectedTaskId)
    const newEntry = await addTimeEntry(selectedTaskId, selectedTask.project_id, today, getCurrentTime())
    
    setTimeEntries([...timeEntries, newEntry])
    setActiveTimerId(newEntry.id)
    setIsPaused(false)
    setElapsedMinutes(0)
    setPausedElapsed(0)
  }

  const handlePauseTimer = () => {
    setIsPaused(true)
    setPausedElapsed(elapsedMinutes)
  }

  const handleResumeTimer = () => {
    setIsPaused(false)
  }

  const handleStopTimer = async () => {
    if (!activeTimerId) return

    const endTime = getCurrentTime()
    await updateTimeEntry(activeTimerId, endTime)

    const updatedEntries = timeEntries.map(e => {
      if (e.id === activeTimerId) {
        const duration = calculateElapsedMinutes(e.start_time)
        return { ...e, end_time: endTime, duration_minutes: duration }
      }
      return e
    })

    setTimeEntries(updatedEntries)
    setActiveTimerId(null)
    setSelectedTaskId(null)
    setIsPaused(false)
    setElapsedMinutes(0)
    setPausedElapsed(0)
  }

  const activeTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null

  if (loading) {
    return <div className="app"><p>Loading...</p></div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Time Tracker</h1>
        <p className="today-date">{today}</p>
      </header>
      
      <main className="app-main">
        <div className="main-layout">
          <section className="section-left">
            <ProjectInput onAdd={handleAddProject} />
            <ProjectList 
              projects={projects}
              onDelete={handleDeleteProject}
              onEdit={handleEditProject}
            />
            <TaskInput projects={projects} onAdd={handleAddTask} />
            <TaskList
              tasks={tasks}
              projects={projects}
              selectedTaskId={selectedTaskId}
              onSelect={handleSelectTask}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              activeTimerId={activeTimerId}
            />
          </section>

          <section className="section-center">
            <TimerDisplay 
              activeTask={activeTask}
              elapsedMinutes={elapsedMinutes}
              isPaused={isPaused}
            />
            <TimerControls
              hasActiveTimer={!!activeTimerId}
              isPaused={isPaused}
              onStart={handleStartTimer}
              onStop={handleStopTimer}
              onPause={handlePauseTimer}
              onResume={handleResumeTimer}
            />
          </section>

          <section className="section-right">
            <TotalsReport
              tasks={tasks}
              projects={projects}
              timeEntries={timeEntries}
              activeTimerId={activeTimerId}
              activeTaskId={selectedTaskId}
              elapsedMinutes={elapsedMinutes}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
