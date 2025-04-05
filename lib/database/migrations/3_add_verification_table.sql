-- down
DROP TABLE IF EXISTS verification;

-- up
CREATE TABLE IF NOT EXISTS verification (
    id bigserial PRIMARY KEY,
    email text NOT NULL,
    code text NOT NULL CHECK (char_length(code::text) <= 6),
    expires timestamp with time zone DEFAULT NOW()
);