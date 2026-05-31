import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { initDb, pool } from './db.js'

const app = express()
const port = process.env.PORT || 4000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: clientOrigin }))
app.use(express.json())

function mapTask(row) {
  return {
    ...row,
    due_date: row.due_date.toISOString().slice(0, 10),
  }
}

async function getStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE done)::int AS done,
      COALESCE(SUM(minutes) FILTER (WHERE done), 0)::int AS minutes
    FROM tasks
  `)

  return result.rows[0]
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/tasks', async (_req, res, next) => {
  try {
    const taskResult = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC, created_at DESC')
    const stats = await getStats()
    res.json({ tasks: taskResult.rows.map(mapTask), stats })
  } catch (error) {
    next(error)
  }
})

app.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, subject, dueDate, minutes } = req.body

    if (!title || !subject || !dueDate || !Number(minutes)) {
      return res.status(400).json({ message: '필수 값이 누락되었습니다.' })
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, subject, due_date, minutes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, subject, dueDate, Number(minutes)],
    )

    res.status(201).json({ task: mapTask(result.rows[0]) })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/tasks/:id', async (req, res, next) => {
  try {
    const { done } = req.body
    const result = await pool.query(
      'UPDATE tasks SET done = $1 WHERE id = $2 RETURNING *',
      [Boolean(done), req.params.id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '계획을 찾을 수 없습니다.' })
    }

    res.json({ task: mapTask(result.rows[0]) })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Planner API listening on ${port}`)
    })
  })
  .catch((error) => {
    console.error('Database initialization failed', error)
    process.exit(1)
  })
