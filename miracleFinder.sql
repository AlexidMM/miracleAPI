DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS laboratories CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS institution_disciplines CASCADE;
DROP TABLE IF EXISTS researcher_disciplines CASCADE;
DROP TABLE IF EXISTS disciplines CASCADE;
DROP TABLE IF EXISTS researchers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'researcher', 'institution', 'admin')),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(50),
    contact_info VARCHAR(255),
    type VARCHAR(50),
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name_p VARCHAR(100) NOT NULL,
    last_name_m VARCHAR(100),
    institution_id INTEGER NOT NULL REFERENCES institutions(id),
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE researchers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name_p VARCHAR(100) NOT NULL,
    last_name_m VARCHAR(100),
    affiliation_id INTEGER REFERENCES institutions(id), -- Opcional (si es independiente)
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- NUEVA TABLA: Laboratorios / Sedes Fijas (para instituciones o investigadores independientes)
CREATE TABLE laboratories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Ej: "Laboratorio de Videojuegos"
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,  -- Latitud GPS fija del laboratorio
    longitude DECIMAL(11, 8) NOT NULL, -- Longitud GPS fija del laboratorio
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    researcher_id INTEGER REFERENCES researchers(id) ON DELETE CASCADE,
    -- Restricción: O pertenece a una institución O pertenece a un investigador independiente (nunca ambos ni ninguno)
    CONSTRAINT chk_lab_owner CHECK (
        (institution_id IS NOT NULL AND researcher_id IS NULL) OR
        (institution_id IS NULL AND researcher_id IS NOT NULL)
    )
);

CREATE TABLE disciplines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE researcher_disciplines (
    researcher_id INTEGER NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
    discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
    PRIMARY KEY (researcher_id, discipline_id)
);

CREATE TABLE institution_disciplines (
    institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
    PRIMARY KEY (institution_id, discipline_id)
);

CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50), -- scholarship, internship, project
    author_id INTEGER NOT NULL REFERENCES users(id),
    institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL, -- Institución a la que pertenece la vacante
    laboratory_id INTEGER REFERENCES laboratories(id) ON DELETE SET NULL, -- Sede física donde se realiza la vacante
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('publication_opened', 'publication_closed')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- RESTRICCIONES CONTRA CLONACIÓN POR DOBLE CLIC (ANTI-SPAM)
-- =========================================================

-- 1. Un autor no puede publicar dos veces exactamente la misma vacante/proyecto
ALTER TABLE publications ADD CONSTRAINT uk_publications_title_author UNIQUE (title, author_id);

-- 2. Evitar instituciones duplicadas por nombre a nivel global
ALTER TABLE institutions ADD CONSTRAINT uk_institutions_name UNIQUE (name);

-- 3. Una institución no puede registrar dos veces un laboratorio con el mismo nombre
CREATE UNIQUE INDEX uk_laboratories_institution_name
ON laboratories (name, institution_id)
WHERE institution_id IS NOT NULL;

-- 4. Un investigador no puede registrar dos veces un laboratorio con el mismo nombre
CREATE UNIQUE INDEX uk_laboratories_researcher_name
ON laboratories (name, researcher_id)
WHERE researcher_id IS NOT NULL;
