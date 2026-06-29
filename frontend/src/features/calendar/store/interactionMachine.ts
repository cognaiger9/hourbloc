// State machine for calendar block interactions
// Pure reducer function that manages interaction state transitions

// === State Types ===
export type InteractionState = 
  | { type: 'idle' }
  | { type: 'pending'; blockId: string; startPos: { x: number; y: number } }
  | { type: 'dragging'; blockId: string }
  | { type: 'resizing'; blockId: string; edge: 'top' | 'bottom' };

// === Event Types ===
export type InteractionEvent =
  | { type: 'MOUSE_DOWN'; blockId: string; position: { x: number; y: number }; edge: 'top' | 'bottom' | null }
  | { type: 'MOUSE_MOVE'; position: { x: number; y: number } }
  | { type: 'MOUSE_UP' }
  | { type: 'CANCEL' };

// === Constants ===
const DRAG_THRESHOLD = 5; // pixels

// === Reducer (Pure Function) ===
export function interactionReducer(
  state: InteractionState, 
  event: InteractionEvent
): InteractionState {
  switch (state.type) {
    case 'idle':
      if (event.type === 'MOUSE_DOWN') {
        if (event.edge) {
          // Direct to resizing when on edge
          return { 
            type: 'resizing', 
            blockId: event.blockId, 
            edge: event.edge 
          };
        }
        // Wait for movement to determine drag vs click
        return { 
          type: 'pending', 
          blockId: event.blockId, 
          startPos: event.position 
        };
      }
      return state;

    case 'pending':
      if (event.type === 'MOUSE_MOVE') {
        const distance = Math.hypot(
          event.position.x - state.startPos.x,
          event.position.y - state.startPos.y
        );
        if (distance > DRAG_THRESHOLD) {
          return { type: 'dragging', blockId: state.blockId };
        }
      }
      if (event.type === 'MOUSE_UP') {
        // No significant movement = this was a click
        return { type: 'idle' };
      }
      if (event.type === 'CANCEL') {
        return { type: 'idle' };
      }
      return state;

    case 'dragging':
      if (event.type === 'MOUSE_UP' || event.type === 'CANCEL') {
        return { type: 'idle' };
      }
      return state;

    case 'resizing':
      if (event.type === 'MOUSE_UP' || event.type === 'CANCEL') {
        return { type: 'idle' };
      }
      return state;

    default:
      return state;
  }
}

// === Helper Functions ===
export function isInteracting(state: InteractionState): boolean {
  return state.type !== 'idle';
}

export function isDragging(state: InteractionState): state is { type: 'dragging'; blockId: string } {
  return state.type === 'dragging';
}

export function isResizing(state: InteractionState): state is { type: 'resizing'; blockId: string; edge: 'top' | 'bottom' } {
  return state.type === 'resizing';
}

export function getActiveBlockId(state: InteractionState): string | null {
  if (state.type === 'idle') return null;
  return state.blockId;
}

