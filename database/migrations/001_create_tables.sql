-- Participants (formerly learners)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cohort_year INTEGER NOT NULL,
    enrollment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('active', 'graduated', 'withdrawn'))
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    expected_timeline_days INTEGER,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_project_number CHECK (project_number >= 1 AND project_number <= 26)
);

-- Project Criteria
CREATE TABLE IF NOT EXISTS project_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    criterion_name TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    what_to_check TEXT,
    files_to_examine JSONB DEFAULT '[]'::jsonb,
    rubric_4 TEXT NOT NULL,
    rubric_3 TEXT NOT NULL,
    rubric_2 TEXT NOT NULL,
    rubric_1 TEXT NOT NULL,
    weight VARCHAR(20) NOT NULL DEFAULT 'important',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_category CHECK (category IN ('code_quality', 'functionality', 'git_workflow', 'architecture', 'documentation')),
    CONSTRAINT valid_weight CHECK (weight IN ('critical', 'important', 'nice_to_have'))
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    github_repo_url TEXT NOT NULL,
    repo_visibility VARCHAR(20) NOT NULL DEFAULT 'unknown',
    submission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    notes_from_participant TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_repo_visibility CHECK (repo_visibility IN ('public', 'private', 'unknown')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'evaluating', 'ai_complete', 'staff_reviewing', 'staff_approved', 'ready_to_share')),
    CONSTRAINT unique_participant_project UNIQUE (participant_id, project_id)
);

-- Staff Users
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'evaluator',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'evaluator', 'viewer'))
);

-- Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(20) NOT NULL DEFAULT 'ai_generated',
    overall_score DECIMAL(3,2),
    what_worked_well JSONB DEFAULT '[]'::jsonb,
    opportunities_for_improvement JSONB DEFAULT '[]'::jsonb,
    development_observations JSONB DEFAULT '{}'::jsonb,
    ai_model_used VARCHAR(50),
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluated_by_staff_id UUID REFERENCES staff_users(id),
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_evaluation_type CHECK (evaluation_type IN ('ai_generated', 'staff_modified'))
);

-- Criterion Scores
CREATE TABLE IF NOT EXISTS criterion_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES project_criteria(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    reasoning TEXT,
    code_references JSONB DEFAULT '[]'::jsonb,
    modified_by_staff BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_score CHECK (score >= 1 AND score <= 4)
);

-- Staff Notes
CREATE TABLE IF NOT EXISTS staff_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    staff_user_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Evaluation History
CREATE TABLE IF NOT EXISTS evaluation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    changed_by_staff_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    change_type VARCHAR(30) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_change_type CHECK (change_type IN ('score_changed', 'reasoning_edited', 'criteria_updated', 'approved'))
);

-- Privacy Logs
CREATE TABLE IF NOT EXISTS privacy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL,
    pii_detected JSONB DEFAULT '{}'::jsonb,
    ai_request_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_action CHECK (action IN ('sanitization_applied', 'ai_evaluation_sent'))
);

-- Indexes for performance
CREATE INDEX idx_participants_cohort ON participants(cohort_year);
CREATE INDEX idx_participants_status ON participants(status);
CREATE INDEX idx_projects_number ON projects(project_number);
CREATE INDEX idx_submissions_participant ON submissions(participant_id);
CREATE INDEX idx_submissions_project ON submissions(project_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_evaluations_submission ON evaluations(submission_id);
CREATE INDEX idx_evaluations_current ON evaluations(is_current);
CREATE INDEX idx_criterion_scores_evaluation ON criterion_scores(evaluation_id);
CREATE INDEX idx_criterion_scores_criterion ON criterion_scores(criterion_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_criteria_updated_at BEFORE UPDATE ON project_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON staff_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_criterion_scores_updated_at BEFORE UPDATE ON criterion_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
