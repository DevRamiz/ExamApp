CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe upgrades for databases created by earlier ExamFlow versions.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'teacher', 'student'));
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_failed_login_attempts_check;
ALTER TABLE users ADD CONSTRAINT users_failed_login_attempts_check CHECK (failed_login_attempts >= 0);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  lecturer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 600),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  pass_score NUMERIC(5,2) NOT NULL DEFAULT 60 CHECK (pass_score BETWEEN 0 AND 100),
  available_from TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

ALTER TABLE exams ADD COLUMN IF NOT EXISTS pass_score NUMERIC(5,2) NOT NULL DEFAULT 60;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ;
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_pass_score_check;
ALTER TABLE exams ADD CONSTRAINT exams_pass_score_check CHECK (pass_score BETWEEN 0 AND 100);
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_availability_window_check;
ALTER TABLE exams ADD CONSTRAINT exams_availability_window_check CHECK (available_from IS NULL OR closes_at IS NULL OR available_from < closes_at);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_score NUMERIC(8,2) NOT NULL DEFAULT 0,
  manual_score NUMERIC(8,2) NOT NULL DEFAULT 0,
  final_score NUMERIC(8,2),
  feedback TEXT NOT NULL DEFAULT '',
  results_published BOOLEAN NOT NULL DEFAULT FALSE,
  deadline_at TIMESTAMPTZ,
  answered_count INTEGER NOT NULL DEFAULT 0 CHECK (answered_count >= 0),
  current_question_id VARCHAR(100),
  last_seen_at TIMESTAMPTZ,
  tab_switches INTEGER NOT NULL DEFAULT 0 CHECK (tab_switches >= 0),
  connection_status VARCHAR(20) NOT NULL DEFAULT 'offline' CHECK (connection_status IN ('online', 'offline', 'submitted')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  UNIQUE (exam_id, student_id)
);

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS answered_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS current_question_id VARCHAR(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS tab_switches INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) NOT NULL DEFAULT 'offline';
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_connection_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_connection_status_check CHECK (connection_status IN ('online', 'offline', 'submitted'));
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_answered_count_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_answered_count_check CHECK (answered_count >= 0);
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_tab_switches_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_tab_switches_check CHECK (tab_switches >= 0);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(60) NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60),
  entity_id VARCHAR(100),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_lecturer ON exams(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_window ON exams(available_from, closes_at);
CREATE INDEX IF NOT EXISTS idx_submissions_exam ON submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_monitoring ON submissions(exam_id, connection_status, last_seen_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
