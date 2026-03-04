import { Match, Player } from './xlsxParser';
import { OpenRouter } from '@openrouter/sdk';

export interface AITeamSelectionResult {
  teamA: Player[];
  teamB: Player[];
  teamExplanation: string;
  playerAssessments: Record<string, string>;
}

const SYSTEM_PROMPT =
  'You are an expert sports analyst that can create balanced teams based on player statistics and historical performance. Your PRIMARY goal is to create two EQUALLY strong teams with balanced skill distribution. The teams should be as evenly matched as possible, ensuring fair competition.';

function buildUserPrompt(players: Player[], matchHistory: Match[]): string {
  return `I need to create two perfectly balanced teams from these players. 
  Please analyze ALL their statistics thoroughly and form two teams that are as BALANCED and FAIR as possible. The goal is to have two teams of EQUAL STRENGTH.
  
  Consider the following in your analysis:
  1. Individual player performance metrics (goals, assists, points per match)
  2. Historical team compositions and results from past matches (if provided)
  3. Even distribution of player skills - do NOT group strong players together
  4. Team balance in terms of offensive and defensive capabilities
  
  In addition to creating balanced teams, please provide:
  1. A detailed explanation of your team selection strategy and how you achieved equal strength between teams
  2. For EACH player, explain specifically why you placed them in their assigned team, citing their stats and historical performance
  3. If using match history data, include specific examples from past games that influenced your distribution of player talent
  4. Explain how you ensured that player skills are evenly distributed between teams
  
  Return a JSON object with the following structure:
  {
    "teamA": ["Player Name 1", "Player Name 2", ...],
    "teamB": ["Player Name 3", "Player Name 4", ...],
    "teamExplanation": "Your detailed explanation of the overall team selection strategy and how you ensured balance...",
    "playerAssessments": {
      "Player Name 1": "Detailed assessment including: why this player was assigned to their team, their key performance metrics, and how this assignment helps create balanced teams...",
      "Player Name 2": "Detailed assessment including: why this player was assigned to their team, their key performance metrics, and how this assignment helps create balanced teams...",
      ...and so on for all players
    }
  }
  
  Here's the complete player data: ${JSON.stringify(players)}
  ${matchHistory.length > 0 ? `And here's the match history data that might be useful for your analysis: ${JSON.stringify(matchHistory)}` : ''}`;
}

export const selectTeamsWithAI = async (
  players: Player[],
  apiKey: string,
  matchHistory: Match[] = [],
): Promise<AITeamSelectionResult> => {
  const openrouter = new OpenRouter({ apiKey });

  const response = await openrouter.chat.send({
    chatGenerationParams: {
      model: 'z-ai/glm-5',
      stream: false, // Změna zde
      responseFormat: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(players, matchHistory) },
      ],
    },
  });

  const content = response.choices[0]?.message?.content || '';

  if (!content) throw new Error('Empty response');

  const result = JSON.parse(String(content));

  function mapPlayers(names: string[]) {
    return names
      .map((name) => players.find((p) => p.name === name))
      .filter(Boolean) as Player[];
  }

  return {
    teamA: mapPlayers(result.teamA),
    teamB: mapPlayers(result.teamB),
    teamExplanation: result.teamExplanation,
    playerAssessments: result.playerAssessments,
  };
};
