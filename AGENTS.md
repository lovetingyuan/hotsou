# Agent Instructions

This document outlines the development guidelines, build processes, and coding standards for the `hotsou` Expo project. All agents and developers must adhere to these rules to maintain codebase consistency and quality.

## 1. Build, Lint, and Test Commands

### Build & Run

- **Android Development**: `npm run android`
  - Runs the app on a connected Android device or emulator.
- **iOS Development**: `npm run ios`
  - Runs the app on the iOS Simulator.
- **Web Development**: `npm run web`
  - Runs the app in a browser.
- **Production Build (Android)**: `npm run build:android`
  - Uses `zx` scripts to generate a release APK/Bundle.
- **Expo Start**: `npm start`
  - Starts the Metro bundler.

### Linting & Validation

- **Lint**: `npm run lint`
  - Executes `eslint` with `expo` configuration.
  - Enforces import sorting (`simple-import-sort`).
- **Type Checking**: `npx tsc --noEmit`
  - Runs the TypeScript compiler to check for type errors without emitting files.
  - **Requirement**: Code must be free of TypeScript errors before completion.
- **Project Health**: `npm run doctor`
  - Checks for Expo and dependency issues.
- **Unused Code**: `npm run knip`
  - Checks for unused files and exports.

### Testing

- **Current Status**: The project does not currently have a test runner script configured in `package.json`.
- **Convention**: If adding tests, use **Jest** (referenced in `devDependencies`).
- **Running a Single Test**: If Jest is configured in the future, use:
  ```bash
  npx jest path/to/file.test.ts
  ```
- **Requirement**: When modifying critical logic, verify behavior manually or add a temporary test script if feasible.

## 2. Code Style Guidelines

### General Formatting

- **Semicolons**: **Avoid semicolons** at the end of lines (Prevalent style in `App.tsx`, `screens/`).
- **Quotes**: Use **single quotes** (`'`) for strings.
- **Indentation**: Use **2 spaces** for indentation.
- **Line Length**: Soft limit of 80-100 characters.
- **Trailing Commas**: Use trailing commas where valid (ES5+).

### Imports

- **Aliases**: Always use the `@/` alias for internal imports.
  - ✅ `import MyComponent from '@/components/MyComponent'`
  - ❌ `import MyComponent from '../../components/MyComponent'`
- **Sorting**: Imports must be sorted. ESLint will enforce this.
  1. External dependencies (`react`, `react-native`, `expo`)
  2. Internal absolute imports (`@/navigation`, `@/components`)
  3. Relative imports (`./Header`)
  4. Styles/Types.

### TypeScript

- **Strict Mode**: `strict: true` is enabled. Handle `null` and `undefined` explicitly.
- **No Any**: Avoid `any`. Use `unknown` or specific types. Define interfaces for Props.
- **Type Definitions**: Prefer `interface` for object shapes and `type` for unions/primitives.
- **Props**: Export prop types for components, e.g., `export type MyComponentProps = { ... }`.

### Naming Conventions

- **Files**: PascalCase for React components (e.g., `AboutScreen.tsx`), camelCase for utilities/hooks (e.g., `useColorScheme.ts`, `formatDate.ts`).
- **Components**: PascalCase (e.g., `function NewsList() { ... }`).
- **Variables/Functions**: camelCase.
- **Constants**: UPPER_SNAKE_CASE for global constants.
- **Styles**: `const styles = StyleSheet.create({ ... })`.

### React & Expo Best Practices

- **Functional Components**: Use functional components with Hooks.
- **Component Size**: Keep components under 300 lines. Refactor complex logic into Hooks or sub-components.
- **Hooks**: Place all Hooks at the top of the component.
- **Styles**: Use `StyleSheet.create`. Avoid inline styles for complex objects.
- **Theming**: Use `useColorScheme` or `useThemeColor` hook for dark/light mode compatibility.
- **Images**: Use `expo-image` for optimized image loading.
- **Navigation**: Use type-safe navigation props (define types in `navigation/` types).

### Error Handling

- **Async/Await**: Use `try/catch` blocks for all async operations.
- **API Calls**: Validate API responses (e.g., using `zod`). Do not assume API structures.
- **UI Feedback**: Provide user feedback on errors (alerts, toasts, or error boundaries).

## 3. Project Structure & Organization

- **`navigation/`**: Root navigation configuration.
- **`screens/`**: Full-page screens (views).
- **`components/`**: Reusable UI components.
  - Group related components in subdirectories (e.g., `components/about/`).
- **`store/`**: Global state management (using `react-atomic-store`).
- **`hooks/`**: Custom React hooks.
- **`utils/`**: Helper functions and utilities.
- **`assets/`**: Static assets (images, fonts).

## 4. Workflow Rules

### API Usage

- **Verification**: Do not invent APIs. Verify library usage via documentation or by checking existing code.
- **Deprecations**: Watch out for deprecated Expo/React Native features.

### Version Control & Commits

- **Conventional Commits**: Use the [Conventional Commits](https://www.conventionalcommits.org) specification.
  - `feat: ...` for new features.
  - `fix: ...` for bug fixes.
  - `refactor: ...` for code restructuring.
  - `docs: ...` for documentation updates.
  - `chore: ...` for build/tooling changes.
- **Message**: Provide a clear description of the change.
- You must output a git commit message at the end of each round task.

### Documentation

- **Comments**: Add comments for complex logic _only_. Explain "why", not "what".
- **Updates**: If you change build scripts or strict patterns, update this file.

## 5. Specific Implementation Details (Legacy/Context)

- **WebView**: The app heavily relies on `react-native-webview` for displaying news sites.
- **Custom Sites**: Users can add their own sites.
- **Zod**: Used for schema validation.
- **System UI**: `expo-system-ui` is used for background colors.

---

_Generated by opencode. Please respect these guidelines to ensure code quality._
