# Supabase Setup for Santrilogy AI

This directory contains the Supabase configuration and migrations for the Santrilogy AI project.

## Project Structure
- `config.toml` - Supabase project configuration
- `migrations/` - Database migration files
  - `20250101000000_setup_santrilogy_v1.sql` - Initial schema for Santrilogy AI

## Schema Features

### 1. Vector Extension (RAG System)
- Enables semantic search for Islamic knowledge base
- Uses pgvector for similarity search
- Optimized for Gemini embedding models

### 2. Auth Integration
- Profiles table linked to Supabase Auth
- Automatic profile creation on user registration
- Row Level Security (RLS) enabled

### 3. RAG (Retrieval Augmented Generation)
- Documents table with vector embeddings for Kitab Kuning
- Similarity search function for knowledge retrieval
- Metadata support for source tracking

### 4. Chat System
- Sessions and messages tables
- Support for multiple roles (user, assistant, system)
- Source tracking for RAG responses

### 5. Specialized Features
- Feature logs for tracking usage of Islamic tools
- Support for tasykil, i'rob, mantiq, and other specialized features

## Deployment Instructions

### Method 1: Using Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of the migration file
4. Execute the script

### Method 2: Using Supabase CLI (when available)
```bash
# After installing Supabase CLI
supabase db push
```

### Method 3: Using psql
```bash
psql "your_supabase_connection_string" -f migrations/20250101000000_setup_santrilogy_v1.sql
```

## Security Features
- Row Level Security prevents cross-user data access
- Authenticated users can only access their own data
- All tables have appropriate RLS policies

## Environment Configuration

In your Supabase project, make sure to:
1. Enable the `vector` extension in Database Extensions
2. Configure Row Level Security policies
3. Set up Auth providers as needed (Google, Email, etc.)

## API Integration

The server.js file in the main directory is configured to connect to Supabase using:
- SUPABASE_URL environment variable
- SUPABASE_ANON_KEY environment variable

## Troubleshooting

If you encounter issues:
1. Verify the vector extension is installed
2. Check that Row Level Security is properly configured
3. Ensure the auth trigger is working correctly
4. Verify all indexes are created

For development, you can use the Supabase CLI to start a local development environment:
```bash
supabase start
```

This will create a local version of your Supabase project with all extensions and data.