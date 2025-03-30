-- down
DROP TABLE IF EXISTS "user";

-- up
CREATE TABLE IF NOT EXISTS "user" (
    id bigserial PRIMARY KEY,
    email text NOT NULL,
    password text NOT NULL,
    verified text DEFAULT false
);