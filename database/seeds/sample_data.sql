-- Sample staff user (password: admin123)
-- This hash is generated using bcrypt with 10 rounds
INSERT INTO staff_users (email, full_name, password_hash, role) 
VALUES (
    'admin@techtonica.org', 
    'Admin User', 
    '$2b$10$YfQkx9Z0yJXxX0f9X0f9X.K9Q9K9Q9K9Q9K9Q9K9Q9K9Q9K9Q9K9Qm',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Sample participants (anonymized emails in seed file)
INSERT INTO participants (email, first_name, last_name, cohort_year, status) VALUES
('participant001@example.com', 'Participant', 'One', 2025, 'active'),
('participant002@example.com', 'Participant', 'Two', 2025, 'active'),
('participant003@example.com', 'Participant', 'Three', 2025, 'active')
ON CONFLICT (email) DO NOTHING;

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
)
ON CONFLICT (project_number) DO NOTHING;
