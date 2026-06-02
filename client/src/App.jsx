import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const PREFERENCE_KEY = 'study-planner-preferences'
const DRAFT_KEY = 'study-planner-draft'
const USER_KEY = 'study-planner-user'

function getTodayDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = getTodayDate()

const defaultPreferences = {
  theme: 'light',
  filter: 'all',
  focusMinutes: 45,
}

const defaultDraft = {
  title: '',
  subject: '웹 프로젝트',
  dueDate: today,
  minutes: 45,
}

function readStorage(key, fallback, storage = localStorage) {
  try {
    const value = storage.getItem(key)
    return value ? { ...fallback, ...JSON.parse(value) } : fallback
  } catch {
    return fallback
  }
}

function createUserId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getStoredUserId() {
  try {
    const savedUserId = localStorage.getItem(USER_KEY)

    if (savedUserId && savedUserId.length <= 120) {
      return savedUserId
    }

    const nextUserId = createUserId()
    localStorage.setItem(USER_KEY, nextUserId)
    return nextUserId
  } catch {
    return createUserId()
  }
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ total: 0, done: 0, minutes: 0 })
  const [preferences, setPreferences] = useState(() => readStorage(PREFERENCE_KEY, defaultPreferences))
  const [draft, setDraft] = useState(() => readStorage(DRAFT_KEY, defaultDraft, sessionStorage))
  const [status, setStatus] = useState('서버 데이터를 불러오는 중입니다.')
  const [currentDate, setCurrentDate] = useState(today)
  const [userId] = useState(getStoredUserId)

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
    localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft])

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDate(getTodayDate())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  async function api(path, options) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Planner-User': userId,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      throw new Error(detail.message || 'API request failed')
    }

    if (response.status === 204) return null
    return response.json()
  }

  async function loadTasks() {
    try {
      const data = await api('/api/tasks')
      setTasks(data.tasks)
      setStats(data.stats)
      setStatus('')
    } catch (error) {
      setStatus(`데이터를 불러오지 못했습니다. ${error.message}`)
    }
  }

  async function createTask(event) {
    event.preventDefault()
    if (!draft.title.trim()) return

    const data = await api('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...draft,
        title: draft.title.trim(),
        minutes: Number(draft.minutes),
      }),
    })

    setTasks((current) => [data.task, ...current])
    setDraft({ ...defaultDraft, subject: draft.subject, minutes: preferences.focusMinutes })
    sessionStorage.removeItem(DRAFT_KEY)
    loadTasks()
  }

  async function toggleTask(task) {
    const data = await api(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: !task.done }),
    })

    setTasks((current) => current.map((item) => (item.id === task.id ? data.task : item)))
    loadTasks()
  }

  async function deleteTask(taskId) {
    await api(`/api/tasks/${taskId}`, { method: 'DELETE' })
    setTasks((current) => current.filter((task) => task.id !== taskId))
    loadTasks()
  }

  const visibleTasks = useMemo(() => {
    if (preferences.filter === 'open') return tasks.filter((task) => !task.done)
    if (preferences.filter === 'done') return tasks.filter((task) => task.done)
    return tasks
  }, [tasks, preferences.filter])

  const todayStats = useMemo(() => {
    const todayTasks = tasks.filter((task) => task.due_date === currentDate)
    const done = todayTasks.filter((task) => task.done).length

    return {
      total: todayTasks.length,
      done,
      progress: todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0,
    }
  }, [tasks, currentDate])

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Final Project Planner</p>
          <h1>공부계획 기록</h1>
        </div>

        <aside className="progress-box" aria-label="오늘 진행률">
          <strong>{todayStats.progress}%</strong>
          <span>오늘의 진행률</span>
          <div className="progress-track">
            <div style={{ width: `${todayStats.progress}%` }} />
          </div>
        </aside>
      </section>

      {status && <p className="status">{status}</p>}

      <section className="workspace">
        <form className="panel form-panel" onSubmit={createTask}>
          <div className="panel-title">
            <h2>계획 추가</h2>
            <button
              type="button"
              className="subtle-button"
              onClick={() => setPreferences((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
            >
              {preferences.theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>

          <label>
            할 일
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="예: Nginx 프록시 설정 정리"
            />
          </label>

          <label>
            과목
            <select value={draft.subject} onChange={(event) => setDraft((prev) => ({ ...prev, subject: event.target.value }))}>
              <option>웹 프로젝트</option>
              <option>데이터베이스</option>
              <option>운영체제</option>
              <option>알고리즘</option>
            </select>
          </label>

          <div className="field-grid">
            <label>
              날짜
              <input type="date" value={draft.dueDate} onChange={(event) => setDraft((prev) => ({ ...prev, dueDate: event.target.value }))} />
            </label>
            <label>
              분
              <input
                type="number"
                min="5"
                step="5"
                value={draft.minutes}
                onChange={(event) => setDraft((prev) => ({ ...prev, minutes: event.target.value }))}
              />
            </label>
          </div>

          <label>
            기본 집중 분: {preferences.focusMinutes}분
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={preferences.focusMinutes}
              onChange={(event) => setPreferences((prev) => ({ ...prev, focusMinutes: Number(event.target.value) }))}
            />
          </label>

          <button className="primary-button" type="submit">저장하기</button>
        </form>

        <section className="panel">
          <div className="summary">
            <article>
              <span>전체</span>
              <strong>{stats.total}</strong>
            </article>
            <article>
              <span>완료</span>
              <strong>{stats.done}</strong>
            </article>
            <article>
              <span>누적</span>
              <strong>{stats.minutes}분</strong>
            </article>
          </div>

          <div className="tabs" role="tablist" aria-label="필터">
            {[
              ['all', '전체'],
              ['open', '진행 중'],
              ['done', '완료'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={preferences.filter === key ? 'active' : ''}
                onClick={() => setPreferences((prev) => ({ ...prev, filter: key }))}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="task-list">
            {visibleTasks.length === 0 ? (
              <p className="empty">표시할 계획이 없습니다.</p>
            ) : (
              visibleTasks.map((task) => (
                <article className={`task ${task.done ? 'done' : ''}`} key={task.id}>
                  <button className="check" type="button" onClick={() => toggleTask(task)} aria-label="완료 상태 변경">
                    {task.done ? '✓' : ''}
                  </button>
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.subject} · {task.due_date} · {task.minutes}분</p>
                  </div>
                  <button className="delete" type="button" onClick={() => deleteTask(task.id)}>삭제</button>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
