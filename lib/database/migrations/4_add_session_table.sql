-- down
DROP TABLE IF EXISTS session;

-- up
CREATE TABLE IF NOT EXISTS session (
    id bigserial PRIMARY KEY,
    session text NOT NULL,
    exp timestamp with time zone NOT NULL,
    user_id bigint REFERENCES "user" (id)
);