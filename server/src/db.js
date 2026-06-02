import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_key TEXT NOT NULL DEFAULT 'legacy-user',
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      due_date DATE NOT NULL,
      minutes INTEGER NOT NULL CHECK (minutes > 0),
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_key TEXT NOT NULL DEFAULT 'legacy-user'")
  await pool.query('CREATE INDEX IF NOT EXISTS tasks_user_key_idx ON tasks (user_key)')
}
