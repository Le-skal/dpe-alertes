-- Table des alertes DPE
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emails TEXT[] NOT NULL,

  -- Filtres géographiques
  villes TEXT[] NOT NULL DEFAULT '{}',

  -- Filtres surface (m²)
  surface_min INTEGER,
  surface_max INTEGER,

  -- Filtres étiquettes (A à G)
  etiquettes_dpe TEXT[] DEFAULT '{}',
  etiquettes_ges TEXT[] DEFAULT '{}',

  -- Filtre type de bien
  types_batiment TEXT[] DEFAULT '{}',

  -- État
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ,
  last_dpe_date TEXT
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_alerts_active ON alerts(active);

-- Commentaires
COMMENT ON TABLE alerts IS 'Alertes DPE configurées par les utilisateurs';
COMMENT ON COLUMN alerts.last_dpe_date IS 'Date du dernier DPE traité (curseur pour éviter les doublons)';
