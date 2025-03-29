DROP TABLE IF EXISTS migration;

CREATE TABLE IF NOT EXISTS migration (
    id bigserial PRIMARY KEY,
    name text NOT NULL
)