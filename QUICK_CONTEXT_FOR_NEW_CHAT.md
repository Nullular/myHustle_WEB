# Quick Context for New Chat

## Project Overview
- **MyHustle Website**: Next.js 15.5.2 web version of successful Android app
- **Goal**: Create neumorphic showcase page for visual component reference
- **Tech Stack**: Next.js, TypeScript, Tailwind CSS, Firebase

## Current Task
Create a neumorphic showcase page at `/neumorphic-showcase` that:
1. Displays all components from `neumorphic/neumorphics.html` 
2. Shows component names and live previews
3. Allows copying component code
4. Has navigation back to main page

## File Structure
```
src/
  app/
    page.tsx (main page - has "Components" link in header)
    neumorphic-showcase/ (NEEDS TO BE CREATED)
      page.tsx (showcase page)
neumorphic/
  neumorphics.html (contains all components with names like: button1, toggle1, deepteethfield, etc.)
```

## Neumorphic Components Available
From `neumorphic/neumorphics.html`:
- button1, toggle1, deepteethfield, pressedcard1
- hoverbutton1, punchcard1, boarderanimatedcard
- sociallink1, beatinglike, dynamichovercard
- dynamichoverprof, titlecard1, animatedbuttonbig

## What I Need
Simple showcase page that:
- Reads from `/neumorphic/neumorphics.html`
- Parses component names and code
- Displays them in a grid with previews
- Has copy-to-clipboard functionality
- Uses neumorphic styling for the page itself

## Development Server
Running on `localhost:3000` with Turbopack

## Priority
Speed over perfection - get it working fast!