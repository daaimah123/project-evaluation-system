#!/bin/bash

echo "🗑️  Dropping all existing database objects..."

psql $DATABASE_URL << EOF
-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS privacy_logs CASCADE;
DROP TABLE IF EXISTS evaluation_history CASCADE;
DROP TABLE IF EXISTS staff_notes CASCADE;
DROP TABLE IF EXISTS criterion_scores CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS project_criteria CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;

-- Drop the update function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

EOF

echo "✅ All tables and functions dropped"
echo ""
echo "🏗️  Creating fresh database schema..."

psql $DATABASE_URL -f database/migrations/001_create_tables.sql

echo ""
echo "🔧 Applying constraint fixes..."

psql $DATABASE_URL -f database/migrations/004_fix_constraints.sql

echo ""
echo "🌱 Seeding sample data..."

psql $DATABASE_URL -f database/seeds/sample_data.sql

echo ""
echo "👤 Creating staff user..."

cd server && node scripts/seed-staff-user.js

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Default login credentials:"
echo "  Email: admin@techtonica.org"
echo "  Password: admin123"
