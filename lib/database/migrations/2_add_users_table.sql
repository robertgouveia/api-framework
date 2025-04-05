-- down
DROP TABLE IF EXISTS "user";

-- up
CREATE TABLE IF NOT EXISTS "user" (
    id bigserial PRIMARY KEY,
    email text NOT NULL,
    password text NOT NULL,
    verified boolean DEFAULT false,
    last_login timestamp with time zone DEFAULT NULL
);