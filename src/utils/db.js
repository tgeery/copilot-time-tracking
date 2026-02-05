import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'TimeTrackerDB';
const DB_VERSION = 1;

// Object store names
const PROJECTS_STORE = 'projects';
const TASKS_STORE = 'tasks';
const TIME_ENTRIES_STORE = 'timeEntries';

let db = null;

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create projects store
      if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = database.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('date', 'date', { unique: false });
      }

      // Create tasks store
      if (!database.objectStoreNames.contains(TASKS_STORE)) {
        const taskStore = database.createObjectStore(TASKS_STORE, { keyPath: 'id' });
        taskStore.createIndex('date', 'date', { unique: false });
        taskStore.createIndex('date_project', ['date', 'project_id'], { unique: false });
      }

      // Create time entries store
      if (!database.objectStoreNames.contains(TIME_ENTRIES_STORE)) {
        const timeStore = database.createObjectStore(TIME_ENTRIES_STORE, { keyPath: 'id' });
        timeStore.createIndex('date', 'date', { unique: false });
        timeStore.createIndex('task_id', 'task_id', { unique: false });
        timeStore.createIndex('date_task', ['date', 'task_id'], { unique: false });
        timeStore.createIndex('date_project', ['date', 'project_id'], { unique: false });
      }
    };
  });
};

// ===== PROJECTS =====

export const getProjectsForToday = (date) => {
  return queryByIndex(PROJECTS_STORE, 'date', date);
};

export const addProject = (name, date) => {
  const project = {
    id: uuidv4(),
    name: name.substring(0, 50),
    date,
    created_at: new Date().toISOString(),
  };
  return putRecord(PROJECTS_STORE, project);
};

export const updateProject = (id, name) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const store = transaction.objectStore(PROJECTS_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      const project = request.result;
      if (project) {
        project.name = name.substring(0, 50);
        const updateRequest = store.put(project);
        updateRequest.onsuccess = () => resolve(project);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Project not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteProject = (id) => {
  return deleteRecord(PROJECTS_STORE, id);
};

// ===== TASKS =====

export const getTasksForToday = (date) => {
  return queryByIndex(TASKS_STORE, 'date', date);
};

export const addTask = (name, date, projectId = null) => {
  const task = {
    id: uuidv4(),
    name: name.substring(0, 50),
    project_id: projectId || null,
    date,
    created_at: new Date().toISOString(),
  };
  return putRecord(TASKS_STORE, task);
};

export const updateTask = (id, name, projectId) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      const task = request.result;
      if (task) {
        task.name = name.substring(0, 50);
        task.project_id = projectId || null;
        const updateRequest = store.put(task);
        updateRequest.onsuccess = () => resolve(task);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Task not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteTask = (id) => {
  return deleteRecord(TASKS_STORE, id);
};

// ===== TIME ENTRIES =====

export const getTimeEntriesForToday = (date) => {
  return queryByIndex(TIME_ENTRIES_STORE, 'date', date);
};

export const addTimeEntry = (taskId, projectId, date, startTime) => {
  const entry = {
    id: uuidv4(),
    task_id: taskId,
    project_id: projectId || null,
    date,
    start_time: startTime, // { hour, minute }
    end_time: null,
    duration_minutes: 0,
    created_at: new Date().toISOString(),
  };
  return putRecord(TIME_ENTRIES_STORE, entry);
};

export const updateTimeEntry = (id, endTime) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TIME_ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(TIME_ENTRIES_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      const entry = request.result;
      if (entry) {
        entry.end_time = endTime; // { hour, minute }
        entry.duration_minutes = calculateDuration(entry.start_time, endTime);
        const updateRequest = store.put(entry);
        updateRequest.onsuccess = () => resolve(entry);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Time entry not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// ===== HELPER FUNCTIONS =====

const putRecord = (storeName, record) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(record);

    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
};

const deleteRecord = (storeName, id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

const queryByIndex = (storeName, indexName, value) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const calculateDuration = (startTime, endTime) => {
  const startMinutes = startTime.hour * 60 + startTime.minute;
  const endMinutes = endTime.hour * 60 + endTime.minute;
  return Math.max(0, endMinutes - startMinutes);
};
