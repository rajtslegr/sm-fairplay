# sm-fairplay

STEM/MARK Fair Play is a Svelte application for creating balanced soccer teams from player statistics and match history.

## Features

- Import one or more XLSX files with player statistics
- Merge repeated players and match history across uploaded files
- Remove individual files or reset all imported data
- Select players manually or use the full imported roster
- Add players manually
- Generate two balanced teams with branch-and-bound optimization
- Balance skill and shared-player synergy from match history
- Inspect player performance and team statistics
- Copy an AI-ready analysis prompt for the generated teams
- Light, dark, and system themes

## Requirements

- Node.js 24, as specified in `.nvmrc`
- pnpm 12.4.2

## Development

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Usage

1. Upload one or more XLSX files containing player statistics.
2. Select the players to include, or keep the full imported roster selected.
3. Add or remove players if needed.
4. Generate teams.
5. Review team composition, scores, synergy, and player performance.
6. Copy the generated prompt for further analysis.

Uploaded files remain available in the current browser session. Removing a file removes the players and match history contributed by that file.

## Team Algorithm

The team selector uses a branch-and-bound search over balanced partitions:

- Player score: goals per match x 6, assists per match x 4, and points per match x 1
- Teams differ by at most one player
- Small uneven teams are balanced by total score; larger teams by average player score
- Match history records winning and losing pairs, while draws are ignored
- Pair synergy uses smoothed win/loss contributions and is balanced between teams
- Branch pruning avoids evaluating partitions that cannot improve the best results
- A near-optimal result is selected to provide variation between runs

## Checks

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

The production build generates a static site through SvelteKit.

## Deployment

Pushes to `main` build and publish the multi-platform container image `ghcr.io/rajtslegr/sm-fairplay:latest` through GitHub Actions.
