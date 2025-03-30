-- down
DROP TABLE IF EXISTS migration;

-- up
CREATE TABLE IF NOT EXISTS migration (
    id bigserial PRIMARY KEY,
    name text NOT NULL
)