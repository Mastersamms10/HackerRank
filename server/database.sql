-- Create database (optional, change name if needed)
CREATE DATABASE IF NOT EXISTS contest_db;
USE contest_db;

-- ------------------------------
-- Table: problems
-- ------------------------------
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sample_input TEXT,
    sample_output TEXT,
    Category TEXT,
    starter_code_python TEXT,
    starter_code_javascript TEXT,
    starter_code_java TEXT,
    starter_code_c TEXT,
    constraints TEXT,
    input_format TEXT,
    output_format TEXT,
    lang TEXT,
    test_cases_public JSON,
    test_cases_hidden JSON
);

-- ------------------------------
-- Table: teams
-- ------------------------------
CREATE TABLE teams (
    team_id VARCHAR(50) PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL
);

-- ------------------------------
-- Table: assigned_problems
-- ------------------------------
CREATE TABLE assigned_problems (
    team_id VARCHAR(50) NOT NULL,
    problem_id INT NOT NULL,
    PRIMARY KEY (team_id, problem_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- ------------------------------
-- Table: submissions
-- ------------------------------
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    team_name VARCHAR(100),
    problem_id INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    output TEXT,
    error TEXT,
    status VARCHAR(50),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);
