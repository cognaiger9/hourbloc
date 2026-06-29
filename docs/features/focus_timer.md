# Focus Timer - State Machine

## Timer States

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> RUNNING: start(tagName)
    RUNNING --> PAUSED: pause()
    PAUSED --> RUNNING: pause()
    RUNNING --> IDLE: finish()
    PAUSED --> IDLE: finish()
    IDLE --> [*]

    note right of IDLE
        isRunning: false
        isPaused: false
        elapsedSeconds: 0
        startTime: null
        originalStartTime: null
    end note

    note right of RUNNING
        isRunning: true
        isPaused: false
        elapsedSeconds: incrementing
        startTime: Date.now()
        Timer updates every 100ms
    end note

    note right of PAUSED
        isRunning: true
        isPaused: true
        elapsedSeconds: frozen
        pausedAt: elapsed ms
        Timer interval cleared
    end note
```

## State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `isRunning` | boolean | Timer is active |
| `isPaused` | boolean | Timer is paused (only if running) |
| `elapsedSeconds` | number | Display time (excludes pauses) |
| `startTime` | number \| null | Adjusted start (for pause/resume) |
| `originalStartTime` | number \| null | Real start (for backend) |
| `pausedAt` | number | Elapsed ms when paused |
