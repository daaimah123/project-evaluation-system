-- Sample staff user (password: admin123)
INSERT INTO staff_users (email, full_name, password_hash, role) 
VALUES (
    'admin@techtonica.org', 
    'Admin User', 
    '$2b$10$rQZ0gYZ5KZ5Y5Y5Y5Y5Y5.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
    'admin'
);

-- Sample participants
INSERT INTO participants (email, first_name, last_name, cohort_year, status) VALUES
('participant1@email.com', 'Jane', 'Doe', 2025, 'active'),
('participant2@email.com', 'John', 'Smith', 2025, 'active'),
('participant3@email.com', 'Maria', 'Garcia', 2025, 'active');

-- Sample project (Project #1)
INSERT INTO projects (
    project_number, 
    name, 
    description, 
    expected_timeline_days, 
    tech_stack
) VALUES (
    1,
    'Personal Portfolio',
    'Build a personal portfolio website showcasing your projects and skills',
    7,
    '["HTML", "CSS", "JavaScript", "React"]'::jsonb
);
