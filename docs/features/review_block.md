# Review Block Fetching Logic

## Overview
This document describes the logic for fetching blocks that start during a day boundary, including blocks that cross midnight into the next day.

## Key Principle
**A block belongs to the day it starts, even if it extends past midnight.**

For example:
- A block from 23:00 (11 PM) to 01:00 (1 AM next day) belongs to the first day
- A block from 23:30 to 00:30 belongs to the day it started, not the day it ended

## Implementation Logic

### 1. Backend Query (Python)

The backend service already implements this correctly by filtering on `start_time`:

```python
async def get_blocks_for_day(
    user_id: str,
    date: datetime,
    block_type: Literal["planned", "actual"] = "actual"
) -> List[Block]:
    """
    Fetch all blocks that START within the specified day boundary.
    This includes blocks that cross midnight.

    Args:
        user_id: User ID
        date: The date (day) to fetch blocks for (already in UTC)
        block_type: Type of blocks to fetch

    Returns:
        List of blocks that started during this day
    """
    # Define day boundaries (both in UTC)
    start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)

    query = (
        self.supabase.table("blocks")
        .select("*")
        .eq("user_id", user_id)
        .eq("block_type", block_type)
        .gte("start_time", start_of_day.isoformat())  # start_time >= start of day
        .lte("start_time", end_of_day.isoformat())    # start_time <= end of day
        .is_("deleted_at", "null")                    # Exclude soft-deleted blocks
        .order("start_time", desc=False)              # Sort by start time
    )

    response = query.execute()
    return [Block(**self._parse_datetime_fields(block_dict)) for block_dict in response.data]
```

**Important**: We filter by `start_time` ONLY, not `end_time`. This ensures:
- Blocks starting at 23:30 and ending at 01:00 are included
- Blocks starting at 00:30 (previous day) and ending at 02:00 are NOT included

### 2. Frontend Query (TypeScript)

The frontend must convert local day boundaries to UTC before querying:

```typescript
async function getBlocksForDate(
  date: Date,
  tags: Tag[],
  timezone: string
): Promise<ReviewBlock[]> {
  // Convert local day boundaries to UTC
  const startOfDayUTC = localToUTC(date, 0, timezone);           // 00:00 local time
  const endOfDayUTC = localToUTC(date, 23.999, timezone);        // 23:59:59.999 local time

  // Query backend with UTC boundaries
  const queryParams = new URLSearchParams({
    start_date: startOfDayUTC,      // Filter: start_time >= this
    end_date: endOfDayUTC,          // Filter: start_time <= this
    block_type: 'actual',
  });

  const apiBlocks = await apiRequest(`/api/v1/blocks/?${queryParams.toString()}`, {
    method: 'GET',
  });

  // Transform API blocks to ReviewBlocks
  return apiBlocks.map(block => transformToReviewBlock(block, tags));
}
```

### 3. Timezone Conversion Details

```typescript
function localToUTC(localDate: Date, localTime: number, timezone: string): string {
  // localTime is in decimal hours (e.g., 14.5 = 14:30)
  const hours = Math.floor(localTime);
  const minutes = Math.round((localTime % 1) * 60);

  // Create date in local timezone
  const dateWithTime = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    hours,
    minutes,
    0
  );

  // Convert to UTC using user's timezone
  const utcDate = fromZonedTime(dateWithTime, timezone);
  return utcDate.toISOString();
}
```

## Example Scenarios

### Scenario 1: Block Within Single Day
```
User timezone: America/New_York (UTC-5)
Local block: 2024-01-10 14:00 - 16:00

Query for 2024-01-10:
  start_date: 2024-01-10T05:00:00.000Z (00:00 EST → UTC)
  end_date:   2024-01-10T04:59:59.999Z next day (23:59 EST → UTC)

Block start_time: 2024-01-10T19:00:00.000Z (14:00 EST → UTC)
Block end_time:   2024-01-10T21:00:00.000Z (16:00 EST → UTC)

Result: ✅ INCLUDED (start_time is within boundary)
```

### Scenario 2: Block Crossing Midnight
```
User timezone: America/New_York (UTC-5)
Local block: 2024-01-10 23:30 - 01:30 (next day)

Query for 2024-01-10:
  start_date: 2024-01-10T05:00:00.000Z
  end_date:   2024-01-11T04:59:59.999Z

Block start_time: 2024-01-11T04:30:00.000Z (23:30 EST → UTC)
Block end_time:   2024-01-11T06:30:00.000Z (01:30 EST → UTC)

Result: ✅ INCLUDED (start_time is within boundary)
```

### Scenario 3: Block Started Previous Day
```
User timezone: America/New_York (UTC-5)
Local block: 2024-01-09 23:00 - 01:00 (crosses to Jan 10)

Query for 2024-01-10:
  start_date: 2024-01-10T05:00:00.000Z
  end_date:   2024-01-11T04:59:59.999Z

Block start_time: 2024-01-10T04:00:00.000Z (23:00 EST on Jan 9 → UTC)
Block end_time:   2024-01-10T06:00:00.000Z (01:00 EST on Jan 10 → UTC)

Result: ❌ EXCLUDED (start_time is before boundary, belongs to Jan 9)
```

## Database Query Performance

The query is optimized with the following index:

```sql
CREATE INDEX idx_blocks_user_type_date_range
ON blocks (user_id, block_type, start_time, end_time)
WHERE deleted_at IS NULL;
```

This composite index allows efficient filtering on:
1. `user_id` (exact match)
2. `block_type` (exact match)
3. `start_time` (range query)
4. Non-deleted blocks only

## Summary

✅ **Correct Approach**: Filter by `start_time` within day boundary
❌ **Wrong Approach**: Filter by `end_time` or both `start_time` and `end_time`

This ensures blocks appear on the day they were started, providing a consistent and intuitive user experience when reviewing daily activities.
