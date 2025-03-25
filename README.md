# sm-fairplay

STEM/MARK Fair Play is a React application designed to help create balanced soccer teams based on player statistics. It allows users to upload player data from an Excel file, select players for team formation, and automatically generates two balanced teams using an optimized algorithm or OpenAI.

## Features

- Upload player statistics from XLSX files
- Select players for team formation
- Add new players on the fly
- Automatically generate two balanced teams using dynamic programming optimization
- AI-powered team selection using OpenAI's API with full player data analysis
- Local storage of OpenAI API key (no server required)
- Display team compositions with individual player statistics

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- pnpm (version 7 or higher)
- OpenAI API key (optional - for AI team selection feature)

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
4. Click "Generate Teams" to create two optimally balanced teams using the built-in algorithm.
5. Alternatively, click "AI Generate Teams" to use OpenAI to create balanced teams.
   - If you haven't set an API key yet, a modal will appear prompting you to enter it.
   - Your API key is stored securely in your browser's local storage.
6. View the generated teams and their player statistics.

## Team Generation Options

### Standard Algorithm

The application uses an advanced dynamic programming algorithm to create balanced teams:

1. Players are initially sorted by their calculated scores
2. The algorithm optimizes team assignments to minimize score differences
3. Teams are kept within one player size difference
4. Score calculation considers:
   - Goals per match (weight: 6)
   - Assists per match (weight: 4)
   - Points per match (weight: 1)

This approach ensures the most balanced possible teams while maintaining computational efficiency.

### AI-Powered Team Selection

For more sophisticated team balancing, the application can use OpenAI's API:

1. Complete player statistics are sent to OpenAI (all available data)
2. The AI analyzes each player's performance metrics holistically
3. Teams are formed using AI's expertise in balancing player abilities
4. The AI determines the most relevant factors for team balancing without any predefined weighting formula

The AI approach offers several advantages:

- Uses all available player data for analysis
- No predetermined formula or weighting system
- Can discover patterns and relationships in player performance that fixed algorithms might miss
- Adapts its analysis based on the specific characteristics of your player set

Note: Using the AI-powered team selection requires an OpenAI API key. The key is stored locally in your browser's storage and is never sent to our servers.

## Running Tests

To run the test suite:

```
pnpm test
```
