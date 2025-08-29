# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal, web-based todo application built with vanilla JavaScript, HTML, and CSS. The app uses InstantDB for backend and database functionality (currently running in demo mode with local state).

## Development Commands

```bash
# Open the app in browser (no build step required)
open index.html

# No npm/package.json - this is a pure vanilla JS app
# No build, lint, or test commands configured yet
```

## Architecture

### File Structure
- `index.html` - Main application file with all UI elements
- `app.js` - Primary JavaScript file with full todo functionality
- `app-simple.js` - Simplified version for debugging without InstantDB
- `styles.css` - All styling using CSS variables and dark theme
- `test.html` / `debug.html` - Testing/debugging versions

### JavaScript Architecture

**State Management**
```javascript
// Global state in app.js
let todos = [...];           // Array of todo objects with order property
let currentUser = { id: 'demo-user' };
let currentEditingTodo = null;
let selectedPriority = 'normal';
let draggedElement = null;   // For drag-and-drop
```

**Todo Object Structure**
```javascript
{
  id: string,              // Unique identifier
  text: string,            // Todo content
  completed: boolean,      // Completion status
  userId: string,          // User ownership
  createdAt: timestamp,    // Creation time
  completedAt?: timestamp, // Completion time (optional)
  order: number,           // For drag-drop ordering
  priority: 'normal'|'high'// Priority level
}
```

**Key Functions Flow**
1. `renderTodos()` - Main render loop that redraws entire UI
2. `createTodoElement()` - Builds individual todo DOM elements
3. `updateStats()` - Updates dashboard counts with animations
4. Drag handlers - `handleDragStart/Over/Drop/End` for reordering
5. Modal handlers - Show/hide add/edit modals
6. CRUD operations - Add/update/delete/toggle todos

### CSS Architecture

**Design System Variables**
- Dark theme with `#0a0a0a` base background
- Blue gradient overlays using `radial-gradient`
- Glass-morphism effects with `backdrop-filter: blur()`
- Consistent spacing scale: `xs(4px), sm(8px), md(16px), lg(24px), xl(32px)`

**Key UI Components**
- Fixed header with title
- Dashboard cards with animated stats
- Todo items with hover actions and drag capability
- Floating add button (bottom-right)
- Modal dialogs with semi-transparent backgrounds

## InstantDB Integration

The app is configured for InstantDB but currently runs in demo mode:
```javascript
// InstantDB initialization (line 2-9 in app.js)
const APP_ID = '986fb340-0e2c-459c-93c9-e38917007a49';
db = instantdb.init({ appId: APP_ID });

// MCP server already configured
claude mcp add instant -s user -t http https://mcp.instantdb.com/mcp
```

## Current Implementation Status

**Completed Features:**
- ✅ Dark theme with sophisticated gradient design
- ✅ Add/edit/delete todos with modal dialogs
- ✅ Drag-and-drop reordering with persistence
- ✅ Priority system (high priority flag only)
- ✅ Dashboard stats with animated counters
- ✅ Checkbox animations and hover effects
- ✅ Glass-morphism modal backgrounds

**Authentication Status:**
- Magic code auth UI exists but is hidden
- Running with demo user (`demo-user`)
- Sign out button hidden via `signoutBtn.style.display = 'none'`

## Important Implementation Details

1. **Event Delegation**: Action buttons (edit/delete) are created per todo item, not delegated
2. **Render Strategy**: Full re-render on any state change via `renderTodos()`
3. **Stats Timing**: Stats elements initialized after main container is shown (line 217)
4. **Priority UI**: Single toggle button for high priority only (no medium/low)
5. **Modal Behavior**: Click overlay to close, Enter key to submit

## Future Enhancements

Already implemented but mentioned for context:
- ~~Drag-and-drop reordering~~ ✅ Completed
- Progress bars
- Reminders
- Tags/categories
- ~~Completion animations~~ ✅ Completed (checkbox animation)