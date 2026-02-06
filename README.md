# Time-Tracking App

A simple web-based time-tracking application for monitoring daily task durations. Track time spent on projects and individual tasks, with real-time reporting and persistent storage.

## Features

- **Project & Task Management**: Create, edit, and delete projects and tasks (max 50 characters)
- **Real-Time Timer**: Start, pause, resume, and stop time tracking on any task
- **Auto-Switching**: Click a different task to automatically stop the current timer and start the new one
- **Daily Reporting**: View total time spent on each task, project, and task-per-project breakdown
- **Persistent Storage**: All data stored in IndexedDB and persists across browser sessions
- **Desktop-Optimized UI**: Clean 3-column layout with prominent timer display

## Getting Started

### Prerequisites
- Node.js 18+ (for development)
- npm or yarn

### Installation

```bash
# Clone the repository and navigate to it
cd copilot-time-tracking

# Install dependencies
npm install

# Build for production
npm run build

# The app is now ready in the dist/ folder
```

### Development

```bash
# Start the development server (requires Node 20+ or 22+)
npm run dev
```

## How to Use

1. **Create a Project** (optional):
   - Enter a project name in "Add Project" and click "Add"
   - Projects help organize tasks

2. **Create a Task**:
   - Enter a task name in "Add Task"
   - Optionally select a project from the dropdown
   - Click "Add"

3. **Start Tracking Time**:
   - Click a task name in the task list to select it
   - Click "Start Timer" to begin tracking
   - The timer will display elapsed time in HH:MM:SS format

4. **Switch Tasks**:
   - Click a different task - the current timer will automatically stop and the new timer will start
   - No time is lost during the switch

5. **Pause and Resume**:
   - Click "Pause" to pause the timer
   - Click "Resume" to continue

6. **Stop Tracking**:
   - Click "Stop" to end the timer and save the time entry
   - The time will appear in the daily reports on the right

7. **View Reports**:
   - **By Task**: Shows total time for each task
   - **By Project**: Shows total time for each project (including tasks without a project)
   - **By Task per Project**: Shows a hierarchical breakdown

## Data Storage

- All data is stored in your browser's **IndexedDB**
- Data is organized by date (today only in this version)
- Reopening the page will restore any active timers
- No data is sent to external servers

## Architecture

- **Frontend**: React 18+ with Vite
- **State Management**: React hooks
- **Database**: IndexedDB (browser-native)
- **Styling**: Plain CSS with flexbox and grid layouts

## Project Structure

```
src/
├── components/          # React components (ProjectInput, TaskList, TimerDisplay, etc.)
├── utils/              # Utility functions (database operations, time formatting)
├── App.jsx             # Main app component
└── App.css             # Global styles
```

## Limitations & Future Enhancements

Current version is focused on daily time tracking. Potential future features:
- Historical data viewing (past days)
- Weekly/monthly reports and statistics
- Data export (CSV, JSON)
- Task descriptions and notes
- Recurring tasks
- Time entry editing after creation
- Keyboard shortcuts
- Mobile-responsive design

## Technical Details

### Time Accuracy
- Times are recorded as hour:minute tuples (no seconds)
- Duration calculated in minutes
- Real-time display updates every second
- Timer continues even if the app loses focus (if browser supports background timers)

### Data Model
- **Projects**: Named groups for organizing tasks
- **Tasks**: Individual work items with optional project assignment
- **Time Entries**: Start/end times for task tracking, calculated duration

## Browser Compatibility

Works in any modern browser that supports:
- ES6+ JavaScript
- IndexedDB
- Flexbox/Grid CSS

Tested on:
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

No specific license - use as you see fit.
