-- Migration: Ajout de tous les nouveaux filtres pour V2
-- Date: 2024-04-01

-- Filtres Chauffage/ECS
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS types_installation_chauffage text[] DEFAULT '{}';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS types_installation_ecs text[] DEFAULT '{}';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS types_energie text[] DEFAULT '{}';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS volume_stockage_ecs_min real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS volume_stockage_ecs_max real DEFAULT NULL;

-- Filtres Batiment
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS hauteur_sous_plafond_min real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS hauteur_sous_plafond_max real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS nombre_appartement_min integer DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS nombre_appartement_max integer DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS nombre_niveau_immeuble_min integer DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS nombre_niveau_immeuble_max integer DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS numero_etage_min integer DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS numero_etage_max integer DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS typologies_logement text[] DEFAULT '{}';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS ratio_surface_min real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS ratio_surface_max real DEFAULT NULL;

-- Filtres Confort/Isolation
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS indicateurs_confort_ete text[] DEFAULT '{}';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS logement_traversant boolean DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS isolation_toiture boolean DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS qualites_isolation_plancher text[] DEFAULT '{}';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS types_ventilation text[] DEFAULT '{}';

-- Filtres Consommation/Emissions
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS conso_energie_min real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS conso_energie_max real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS emission_ges_min real DEFAULT NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS emission_ges_max real DEFAULT NULL;
