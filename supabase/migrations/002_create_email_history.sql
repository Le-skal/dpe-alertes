-- Table d'historique des emails envoyés
CREATE TABLE email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  alert_name TEXT NOT NULL,

  -- Détails de l'envoi
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  recipients TEXT[] NOT NULL,
  dpe_count INTEGER NOT NULL,

  -- Résumé des DPE (JSON pour flexibilité)
  dpe_summary JSONB DEFAULT '[]'
);

-- Index pour les requêtes
CREATE INDEX idx_email_history_alert_id ON email_history(alert_id);
CREATE INDEX idx_email_history_sent_at ON email_history(sent_at DESC);

-- Commentaires
COMMENT ON TABLE email_history IS 'Historique des emails envoyés par le système';
COMMENT ON COLUMN email_history.dpe_summary IS 'Résumé des DPE envoyés (adresse, ville, étiquettes)';
