# Development Rules

## 1. General Principles
- **Robustness**: Write defensive code. Validate inputs and handle edge cases gracefully.
- **Clarity**: Prioritize code readability over cleverness. Use descriptive variable and function names.
- **Modularity**: Break down complex logic into smaller, reusable components or hooks.

## 2. Technology Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Required for shadcn/ui)
- **UI Library**: shadcn/ui

## 3. TypeScript Guidelines
- **Strict Typing**: Avoid `any` whenever possible. Define interfaces or types for all props and state.
- **Functional Components**: Use `React.FC` or explicitly type props.
- **Hooks**: Use custom hooks to separate logic from UI.

## 4. Component Structure
- **Colocation**: Keep related files (component, types, utils) close to each other or in dedicated folders if they grow large.
- **Props**: Use interface for props definition.
- **Export**: Use named exports mainly, or default exports for pages/lazy-loaded components.

## 5. State Management
- **Local State**: Use `useState` for simple component-level state.
- **Complex State**: Use `useReducer` or context for complex interactions if needed.

## 6. Code Quality
- **Linter**: Ensure code passes ESLint checks.
- **Formatting**: Adhere to Prettier configuration.
- **Comments**: Comment complex logic, explicitly explaining "Why", not just "What".

## 7. Git / Version Control
- **Commits**: Use conventional commits (feat, fix, docs, style, refactor, test, chore).

## 8. Communication
- **Language**: Use English for internal reasoning/inference, but use **Traditional Chinese (繁體中文)** when interacting with the developer (User).
