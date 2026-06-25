-- Tabla de notificaciones para el wearable (ejecutar si ya tienes la BD creada)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('publication_opened', 'publication_closed')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
