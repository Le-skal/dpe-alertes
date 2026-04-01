-- Migration: Ajout de user_id pour séparer les alertes par utilisateur
-- user_id NULL = alertes partagées (invités)
-- user_id = uuid = alertes privées (utilisateur connecté)

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);

-- Même chose pour email_history
ALTER TABLE email_history ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
