import { getPool } from "../src/adapters/node/db";

const SQL = `
CREATE TABLE IF NOT EXISTS sessions (
  id            uuid PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  ua_hash       text,
  ip_hash       text
);

CREATE TABLE IF NOT EXISTS readings (
  id               uuid PRIMARY KEY,
  session_id       uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('bazi','hepan','naming','palm')),
  status           text NOT NULL CHECK (status IN ('pending','processing','ready','error')),
  title            text NOT NULL,
  input_json       jsonb NOT NULL,
  structure_json   jsonb,
  result_markdown  text,
  image_key        text,
  error_message    text,
  model            text,
  tokens_in        int,
  tokens_out       int,
  created_at       timestamptz NOT NULL DEFAULT now(),
  ready_at         timestamptz
);

-- Upgrade path for volumes created before processing status existed
DO $$
BEGIN
  ALTER TABLE readings DROP CONSTRAINT IF EXISTS readings_status_check;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE readings
    ADD CONSTRAINT readings_status_check
    CHECK (status IN ('pending','processing','ready','error'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS readings_session_created_idx
  ON readings (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS readings_status_created_idx
  ON readings (status, created_at)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS stats_daily (
  day          date PRIMARY KEY,
  visits       int NOT NULL DEFAULT 0,
  calculated   int NOT NULL DEFAULT 0
);

-- 会话最近访问信息（明文，供后台查看）
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_ip text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_ua text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_path text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS visit_count int NOT NULL DEFAULT 0;

-- 访问记录明细
CREATE TABLE IF NOT EXISTS visit_logs (
  id               uuid PRIMARY KEY,
  session_id       uuid REFERENCES sessions(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  ip               text,
  user_agent       text,
  referer          text,
  path             text,
  method           text,
  accept_language  text,
  country          text
);

CREATE INDEX IF NOT EXISTS visit_logs_created_idx
  ON visit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS visit_logs_session_created_idx
  ON visit_logs (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS visit_logs_ip_created_idx
  ON visit_logs (ip, created_at DESC);
`;

async function main() {
  const pool = getPool();
  try {
    await pool.query(SQL);
    // Ensure no sqlite artifacts are expected — this project is Postgres-only.
    console.log("migrate: ok (postgres)");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("migrate failed", err);
  process.exit(1);
});
