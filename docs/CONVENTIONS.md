# Development Conventions

## Timezone Rules

### Storage (Backend/Database)
- **All datetime values MUST be stored in UTC** in the database
- Backend models use timezone-aware datetime objects (`datetime` with `timezone.utc`)
- API responses include ISO 8601 datetime strings with timezone information (e.g., `"2024-01-15T14:30:00+00:00"`)

### Transmission (API)
- API requests MUST include timezone information in all datetime fields
  - Valid formats: `"2024-01-15T10:30:00Z"` or `"2024-01-15T10:30:00+00:00"`
  - API will reject datetime strings without timezone info (400 error)
- API responses include both:
  - Display strings (e.g., `"9:00 AM"`) - formatted in UTC for backward compatibility
  - ISO datetime strings (e.g., `startDateTime`, `endDateTime`) - for timezone conversion

### Display (Frontend)
- **All datetime values MUST be converted to user's local timezone** before display
- Use browser's native `Date` object to handle automatic timezone conversion
- Calculate positions/percentages based on local time, not UTC
- Format times using local timezone (e.g., `date.getHours()` for local hours)

### Key Principle
**Store UTC, Display Local** - Backend is timezone-agnostic (UTC only), Frontend handles all timezone conversions for the user.
