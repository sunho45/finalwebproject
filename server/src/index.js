import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { initDb, pool } from './db.js'

const app = express()
const port = process.env.API_PORT || process.env.PORT || 4000
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:8080')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
let dbReadyPromise = initDb()
  .then(() => {
    console.log('Database initialized')
    return true
  })
  .catch((error) => {
    console.error('Database initialization failed', error)
    return false
  })

app.disable('x-powered-by')
app.use(cors({
  origin(origin, callback) {
    const isRenderOrigin = origin?.endsWith('.onrender.com')

    if (!origin || allowedOrigins.includes(origin) || isRenderOrigin) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
}))
app.use(express.json())

function mapTask(row) {
  return {
    ...row,
    due_date: row.due_date.toISOString().slice(0, 10),
  }
}

function getUserKey(req) {
  const userKey = req.get('X-Planner-User')?.trim()

  if (!userKey || userKey.length > 120) {
    return null
  }

  return userKey
}

function requireUser(req, res, next) {
  const userKey = getUserKey(req)

  if (!userKey) {
    res.status(400).json({ message: 'User key is required.' })
    return
  }

  req.userKey = userKey
  next()
}

async function getStats(userKey) {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE done)::int AS done,
      COALESCE(SUM(minutes) FILTER (WHERE done), 0)::int AS minutes
    FROM tasks
    WHERE user_key = $1
  `, [userKey])

  return result.rows[0]
}

async function ensureDbReady() {
  if (await dbReadyPromise) {
    return
  }

  dbReadyPromise = initDb()
    .then(() => {
      console.log('Database initialized')
      return true
    })
    .catch((error) => {
      console.error('Database initialization failed', error)
      return false
    })

  if (!(await dbReadyPromise)) {
    throw new Error('Database is not ready.')
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await ensureDbReady()
    res.json({ status: 'ok', database: 'ok' })
  } catch {
    res.status(503).json({ status: 'error', database: 'not-ready' })
  }
})

app.use('/api/tasks', requireUser)

app.get('/api/tasks', async (req, res, next) => {
  try {
    await ensureDbReady()
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE user_key = $1 ORDER BY due_date ASC, created_at DESC',
      [req.userKey],
    )
    const stats = await getStats(req.userKey)
    res.json({ tasks: taskResult.rows.map(mapTask), stats })
  } catch (error) {
    next(error)
  }
})

app.post('/api/tasks', async (req, res, next) => {
  try {
    await ensureDbReady()
    const { title, subject, dueDate, minutes } = req.body

    if (!title || !subject || !dueDate || !Number(minutes)) {
      return res.status(400).json({ message: 'Required fields are missing.' })
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_key, title, subject, due_date, minutes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userKey, title, subject, dueDate, Number(minutes)],
    )

    res.status(201).json({ task: mapTask(result.rows[0]) })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/tasks/:id', async (req, res, next) => {
  try {
    await ensureDbReady()
    const { done } = req.body
    const result = await pool.query(
      'UPDATE tasks SET done = $1 WHERE id = $2 AND user_key = $3 RETURNING *',
      [Boolean(done), req.params.id, req.userKey],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found.' })
    }

    res.json({ task: mapTask(result.rows[0]) })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    await ensureDbReady()
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_key = $2',
      [req.params.id, req.userKey],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found.' })
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Server error.' })
})

app.listen(port, () => {
  console.log(`Planner API listening on ${port}`)
})
