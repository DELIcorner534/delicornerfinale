-- Delicorner - Création des tables Supabase/PostgreSQL
-- Exécutez ce script une fois dans l'éditeur SQL de Supabase (SQL Editor)

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_class TEXT,
    customer_school TEXT,
    delivery_date TEXT,
    items TEXT NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    status TEXT DEFAULT 'pending',
    whatsapp_sent SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_counter (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    year INTEGER NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_tokens (
    token TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    order_code TEXT NOT NULL,
    payload TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_created_at ON payment_tokens(created_at);

-- Initialiser le compteur (une seule ligne avec id=1)
INSERT INTO order_counter (id, year, counter)
VALUES (1, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 0)
ON CONFLICT (id) DO NOTHING;
