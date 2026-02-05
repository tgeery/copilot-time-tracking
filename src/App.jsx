import { useState, useEffect } from 'react'
import { initDB, getProjectsForToday, getTasksForToday, getTimeEntriesForToday } from './utils/db'
import { getTodayDateString } from './utils/time'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState(getTodayDateString())
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [activeTimerId, setActiveTimerId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)

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
    } catch (error) {
      console.error('Failed to load today data:', error)
    }
  }

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
        <p>Database initialized. Ready to build components!</p>
        <p>Projects: {projects.length}, Tasks: {tasks.length}, Time Entries: {timeEntries.length}</p>
      </main>
    </div>
  )
}

export default App
