-- Ajouter les colonnes de filtre sur la date de visite du diagnostiqueur

ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS date_filter_type TEXT DEFAULT 'alerte',
ADD COLUMN IF NOT EXISTS date_visite_min DATE,
ADD COLUMN IF NOT EXISTS date_visite_max DATE;

-- Commentaires
COMMENT ON COLUMN alerts.date_filter_type IS 'Type de filtre: alerte (nouveaux), entre (2 dates), depuis (1 date), tous';
COMMENT ON COLUMN alerts.date_visite_min IS 'Date de visite minimum';
COMMENT ON COLUMN alerts.date_visite_max IS 'Date de visite maximum';
