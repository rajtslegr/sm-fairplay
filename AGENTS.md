# AGENTS.md - Development Guide for sm-fairplay

## Build & Development Commands

### Core Commands

- `pnpm dev` - Start development server (port 5173)
- `pnpm build` - Production build
- `pnpm preview` - Preview production build

### Testing Commands

- `pnpm test` - Run unit tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:run <test-file>` - **Run specific test file** (e.g., `pnpm test:run src/components/PlayerCard.test.tsx`)
- `pnpm test:run <pattern>` - **Run tests matching pattern** (e.g., `pnpm test:run "player"`)

### Linting & Code Quality

- `pnpm lint` - Run ESLint (check for errors)
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm type:check` - TypeScript type checking

### E2E Testing

- `pnpm e2e` - Run Playwright E2E tests
- `pnpm e2e:ui` - Run E2E tests with UI mode

### Storybook

- `pnpm storybook` - Start Storybook development server

## Code Style Guidelines

### Import Organization

```typescript
// 1. External libraries (3rd party)
import React from 'react';
import { z } from 'zustand';

// 2. Internal modules (relative imports)
import { useStore } from '../store/store';
import { PlayerCard } from './PlayerCard';
import { formatDate } from '../utils/dateUtils';

// 3. Absolute imports (configured path aliases)
import { useTeamFormation } from '@/hooks/useTeamFormation';
import { playerAPI } from '@/api/playerAPI';
```

### TypeScript & Type Safety

- Use strict TypeScript mode (already configured)
- Prefer `interface` over `type` for object types
- Use `const` assertions for literal types when appropriate
- Avoid `any` - use proper typing or `unknown`
- Use `@ts-expect-error` only when absolutely necessary

### React Component Patterns

```typescript
// Functional components with explicit typing
interface PlayerCardProps {
  player: Player;
  onSelect: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onSelect }) => {
  // Component implementation
};

// Use hooks consistently - prefer custom hooks
const usePlayerSelection = () => {
  const { selectedPlayers, addPlayer, removePlayer } = usePlayerStore();

  return { selectedPlayers, addPlayer, removePlayer };
};
```

### State Management (Zustand)

```typescript
// Store definition
interface PlayerStore {
  players: Player[];
  selectedPlayers: Player[];
  isLoading: boolean;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
}

const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  selectedPlayers: [],
  isLoading: false,
  addPlayer: (player) =>
    set((state) => ({ selectedPlayers: [...state.selectedPlayers, player] })),
  removePlayer: (playerId) =>
    set((state) => ({
      selectedPlayers: state.selectedPlayers.filter((p) => p.id !== playerId),
    })),
}));
```

### Error Handling

```typescript
// Use try-catch for async operations
const importPlayersFromFile = async (file: File) => {
  try {
    const players = await parseExcelFile(file);
    usePlayerStore.getState().setPlayers(players);
  } catch (error) {
    console.error('Failed to import players:', error);
    toast.error('Failed to import players from file');
  }
};

// Proper error types
class PlayerImportError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'PlayerImportError';
  }
}
```

### File Naming Conventions

- Components: PascalCase (e.g., `PlayerCard.tsx`)
- Hooks: `use` prefix + PascalCase (e.g., `usePlayerSelection.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Stores: camelCase (e.g., `playerStore.ts`)
- Types: PascalCase (e.g., `Player.ts`)

### Testing Patterns

```typescript
// Component testing with Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';

describe('PlayerCard', () => {
  it('renders player information', () => {
    const mockPlayer = { id: '1', name: 'John Doe', rating: 85 };
    render(<PlayerCard player={mockPlayer} onSelect={jest.fn()} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    const mockPlayer = { id: '1', name: 'John Doe', rating: 85 };
    render(<PlayerCard player={mockPlayer} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('John Doe'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockPlayer);
  });
});
```

### API Integration

```typescript
// API client with proper typing
interface PlayerAPI {
  getPlayers: () => Promise<Player[]>;
  createPlayer: (player: Omit<Player, 'id'>) => Promise<Player>;
  updatePlayer: (id: string, player: Partial<Player>) => Promise<Player>;
}

// Use custom hooks for API operations
const usePlayerAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const players = await playerAPI.getPlayers();
      return players;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchPlayers, isLoading };
};
```

### Tailwind CSS

- Use Tailwind classes instead of custom CSS when possible
- Prefer utility classes over custom styles
- Use shadcn/ui components as base
- Follow BEM-like naming for custom components

### Pre-commit Hooks

- Husky + lint-staged configured to run linting automatically
- All commits must pass ESLint and TypeScript checks
- Test files should be updated with new code

## Important Notes for AI Agents

1. **Always run `pnpm type:check` before committing changes**
2. **Follow the existing import order and organization**
3. **Use the established component patterns and naming conventions**
4. **Write tests for new features and critical bug fixes**
5. **Use absolute imports (`@/`) for internal modules**
6. **Maintain the existing state management patterns with Zustand**
7. **Follow the error handling patterns shown above**
8. **Use TypeScript strict mode - no `any` types allowed**
9. **Run `pnpm lint:fix` to automatically fix formatting issues**
10. **Test both unit and E2E tests when making significant changes**
