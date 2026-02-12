import { Match, Player } from './xlsxParser';
import { OpenRouter } from '@openrouter/sdk';

export interface AITeamSelectionResult {
  teamA: Player[];
  teamB: Player[];
  teamExplanation: string;
  playerAssessments: Record<string, string>;
}

const SYSTEM_PROMPT =
  'You are an expert sports analyst. Create two EQUALLY strong teams. Return ONLY valid JSON.';

function buildUserPrompt(players: Player[], matchHistory: Match[]): string {
  const history =
    matchHistory.length > 0
      ? `\nMatch history: ${JSON.stringify(matchHistory.slice(-5))}`
      : '';

  return `Create two balanced teams from these ${players.length} players. Goal: EQUAL team strength.

  Rules:
  1. Balance by: goals/match, assists/match, points/match
  2. Use match history if provided
  3. Distribute strong players evenly

  Return EXACTLY this JSON structure (no markdown, no extra text):
  {
    "teamA": ["Player Name 1", "Player Name 2", ...],
    "teamB": ["Player Name 3", "Player Name 4", ...],
    "teamExplanation": "Brief strategy explanation (2-3 sentences)",
    "playerAssessments": {
      "Player Name 1": "One sentence: why assigned here, key stats",
      "Player Name 2": "One sentence: why assigned here, key stats"
    }
  }

  Player data: ${JSON.stringify(players)}${history}`;
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
