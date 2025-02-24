ALTER TABLE signals ADD COLUMN IF NOT EXISTS parsed_data JSONB;
CREATE INDEX IF NOT EXISTS idx_signals_parsed_data ON signals USING gin (parsed_data); 