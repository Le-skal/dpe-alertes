-- Table pour stocker l'état du cron
-- Permet de savoir si la base ADEME a été mise à jour depuis le dernier check

CREATE TABLE IF NOT EXISTS cron_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_ademe_date TEXT,  -- Dernière date de mise à jour ADEME traitée
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la ligne initiale
INSERT INTO cron_state (id, last_ademe_date, last_run_at)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Désactiver RLS pour simplifier
ALTER TABLE cron_state DISABLE ROW LEVEL SECURITY;
