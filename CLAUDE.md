# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal, web-based todo application built with vanilla JavaScript, HTML, and CSS. The app uses InstantDB for backend and database functionality.

## Architecture

- **Frontend**: Vanilla JavaScript, HTML, CSS (no framework)
- **Backend/Database**: InstantDB (https://www.instantdb.com/)
- **Authentication**: InstantDB Auth
- **Hosting**: Vercel
- **Version Control**: GitHub

## Key Design Requirements

- Single-page application with one core screen
- Minimalist design inspired by Notion
- Dark mode with deep navy accent colors
- Clean, sophisticated interface following Apple Human Interface Guidelines

## Core Functionalities

1. Authentication (login/signup/logout) - users only see their own data
2. Task management:
   - Add new tasks with floating "+" button
   - Mark tasks as complete with checkboxes
   - Edit tasks by clicking on them
   - Delete tasks by long press
3. Simple task list display on home screen

## Development Setup

```bash
# Install dependencies (if package.json exists)
npm install

# Run local development server
# Note: Update this command once development server is configured
```

## Testing Commands

```bash
# Run tests (to be configured)
# Run linter (to be configured)
# Run type checking (to be configured)
```

## InstantDB Integration

The app uses InstantDB MCP server which is already configured:
```bash
claude mcp add instant -s user -t http https://mcp.instantdb.com/mcp
```

## Important Notes

- Keep the interface minimal and focused
- Follow the single-screen design principle
- Use the floating "+" button pattern from the Things app
- Implement satisfying UI feedback for task completion
- Future enhancements may include: drag-and-drop reordering, progress bars, reminders, tags/categories, completion animations