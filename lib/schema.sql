-- Schéma de la base — § 4.4. Trois tables, rien de plus.
-- Source unique : lu par `lib/bdd.ts` au démarrage et par le script d'import.

CREATE TABLE IF NOT EXISTS produits (
  id                INTEGER PRIMARY KEY,
  reference         TEXT UNIQUE NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  nom               TEXT NOT NULL,
  marque            TEXT NOT NULL,
  categorie         TEXT NOT NULL,
  matiere           TEXT,
  pointure_min      INTEGER NOT NULL,
  pointure_max      INTEGER NOT NULL,
  description       TEXT,
  prix_interne_fcfa INTEGER,          -- JAMAIS publie (§ 3.3)
  image             TEXT,
  actif             INTEGER NOT NULL DEFAULT 1,
  cree_le           TEXT NOT NULL,
  modifie_le        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coloris (
  id         INTEGER PRIMARY KEY,
  produit_id INTEGER NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  libelle    TEXT NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin (
  id                 INTEGER PRIMARY KEY,
  email              TEXT UNIQUE NOT NULL,
  mot_de_passe_hash  TEXT NOT NULL,
  derniere_connexion TEXT
);

CREATE INDEX IF NOT EXISTS idx_produits_actif     ON produits(actif);
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_coloris_produit    ON coloris(produit_id);
