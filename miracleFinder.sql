DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS researchers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'researcher', 'institution')),
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
    affiliation_id INTEGER REFERENCES institutions(id), -- Optional
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50), -- scholarship, internship, project
    author_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    body TEXT NOT NULL,
    answer TEXT,
    student_id INTEGER NOT NULL REFERENCES students(id),
    publication_id INTEGER NOT NULL REFERENCES publications(id),
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE
);
