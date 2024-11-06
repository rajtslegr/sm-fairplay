# sm-fairplay

STEM/MARK Fair Play is a React application designed to help create balanced soccer teams based on player statistics. It allows users to upload player data from an Excel file, select players for team formation, and automatically generates two balanced teams using an optimized algorithm.

## Features

- Upload player statistics from XLSX files
- Select players for team formation
- Add new players on the fly
- Automatically generate two balanced teams using dynamic programming optimization
- Display team compositions with individual player statistics

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- pnpm (version 7 or higher)

### Installation

1. Install dependencies:

   ```
   pnpm install
   ```

2. Start the development server:

   ```
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to view the application.

## Usage

1. Click the "Upload XLSX File" button to upload a file containing player statistics.
2. Select players for team formation from the list of uploaded players.
3. Optionally, add new players using the "Add New Player" input field and button.
4. Click "Generate Teams" to create two optimally balanced teams.
5. View the generated teams and their player statistics.

## Team Generation Algorithm

The application uses an advanced dynamic programming algorithm to create balanced teams:

1. Players are initially sorted by their calculated scores
2. The algorithm optimizes team assignments to minimize score differences
3. Teams are kept within one player size difference
4. Score calculation considers:
   - Goals per match (weight: 6)
   - Assists per match (weight: 4)
   - Points per match (weight: 1)

This approach ensures the most balanced possible teams while maintaining computational efficiency.

## Running Tests

To run the test suite:

```
pnpm test
```
