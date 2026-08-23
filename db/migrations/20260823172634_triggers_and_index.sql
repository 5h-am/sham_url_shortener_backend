-- migrate:up

CREATE INDEX idx_urls_users_id ON urls(users_id);
CREATE INDEX idx_clicks_urls_id ON clicks(urls_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_urls_code ON urls(urls_code);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_is_active ON clicks(is_active);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURN TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql'


CREATE TRIGGER update_users_updated_at_column
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- migrate:down

DROP TRIGGER IF EXISTS update_users_updated_at_column;

DROP INDEX IF EXISTS idx_clicks_is_active;
DROP INDEX IF EXISTS idx_clicks_clicked_at;
DROP INDEX IF EXISTS idx_urls_code;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_clicks_urls_id;
DROP INDEX IF EXISTS idx_urls_users_id;
