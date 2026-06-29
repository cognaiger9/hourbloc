# HourBloc API Backend

FastAPI backend for the HourBloc time tracking application.

## Setup

### Prerequisites
- Python 3.11 or higher
- pip

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual configuration
```

5. Set up the database schema (see Database Setup section below)

## Database Setup

### Prerequisites
- A Supabase project created at https://supabase.com
- Supabase project URL and API keys

### Running Migrations

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and execute the SQL in the SQL Editor

The migration will create:
- `tags` table for user-defined tags
- `blocks` table for planned and actual time blocks
- Row Level Security (RLS) policies for data isolation
- Indexes for query performance
- Triggers for automatic timestamp updates

### Database Schema Overview

#### Tables

**tags**
- Stores user-defined tags for categorizing blocks
- Fields: id, user_id, name, color, icon, timestamps
- Supports soft deletes via `deleted_at` field

**blocks**
- Stores both planned and actual time blocks
- Fields: id, user_id, block_type ('planned' or 'actual'), title, start_time, end_time, tag_id, notes, timestamps
- Supports soft deletes via `deleted_at` field
- Foreign key relationship to tags table

#### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only view their own data
- Users can only create/update/delete their own data
- Soft-deleted records are automatically filtered out in SELECT queries

#### Indexes

The schema includes optimized indexes for:
- User-based queries (`user_id`)
- Block type filtering (`user_id`, `block_type`)
- Date range queries (`start_time`, `end_time`)
- Tag lookups (`tag_id`)

### Verifying the Schema

After running the migration, you can verify the tables were created:
1. Go to Supabase Dashboard → Table Editor
2. You should see `tags` and `blocks` tables
3. Check that RLS is enabled (shown in table settings)

## Running the Server

### Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Example environment variables
├── migrations/
│   └── 001_initial_schema.sql  # Database migration file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── api.py     # API router aggregation
│   │       └── endpoints/ # API endpoints
│   │           ├── blocks.py
│   │           ├── tags.py
│   │           └── analytics.py
│   ├── core/
│   │   ├── config.py      # Configuration settings
│   │   ├── supabase.py    # Supabase client utilities
│   │   ├── dependencies.py # Authentication dependencies
│   │   └── database.py    # Database helper functions
│   └── schemas/           # Pydantic models
│       ├── block.py
│       └── tag.py
```

## API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

### Time Blocks
- `GET /api/v1/blocks` - Get all blocks
- `POST /api/v1/blocks` - Create a new block
- `PUT /api/v1/blocks/{block_id}` - Update a block
- `DELETE /api/v1/blocks/{block_id}` - Delete a block

### Tags
- `GET /api/v1/tags` - Get all tags
- `POST /api/v1/tags` - Create a new tag
- `PUT /api/v1/tags/{tag_id}` - Update a tag
- `DELETE /api/v1/tags/{tag_id}` - Delete a tag

### Analytics
- `GET /api/v1/analytics/day` - Get day analytics
- `GET /api/v1/analytics/week` - Get week analytics
- `GET /api/v1/analytics/year` - Get year analytics

## Authentication

This API uses **Supabase Authentication**. All protected endpoints require a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer <your_supabase_jwt_token>
```

### Protected Endpoints
All endpoints under `/api/v1/blocks` and `/api/v1/tags` require authentication. The authenticated user's ID is automatically available via the `get_current_user` dependency.

### Example Usage
```python
from app.core.dependencies import get_current_user

@router.get("/protected")
async def protected_route(user: dict = Depends(get_current_user)):
    user_id = user["id"]  # Supabase user ID
    email = user["email"]  # User email
    # ... your logic here
```

## Next Steps

1. Configure your Supabase credentials in `.env`
2. Run the database migration (see Database Setup section above)
3. Connect endpoints to database operations using Supabase client
4. Implement business logic in endpoints
5. Test authentication flow with your frontend

## Database Helper Functions

The `app/core/database.py` module provides helper functions for common database operations:

- `get_user_blocks()` - Query blocks with filtering options
- `get_user_tags()` - Query user tags
- `create_block()` / `create_tag()` - Create new records
- `update_block()` / `update_tag()` - Update existing records
- `soft_delete_block()` / `soft_delete_tag()` - Soft delete records

These helpers handle user isolation, soft delete filtering, and common query patterns.

## Development

### Installing New Dependencies
```bash
pip install package_name
pip freeze > requirements.txt
```

### Testing
Visit http://localhost:8000/docs to test the API using the interactive Swagger UI.


