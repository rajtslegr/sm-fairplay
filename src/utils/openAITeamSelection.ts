import OpenAI from 'openai';

import { Match, Player } from './xlsxParser';

export interface AITeamSelectionResult {
  teamA: Player[];
  teamB: Player[];
  teamExplanation: string;
  playerAssessments: Record<string, string>;
}

export const selectTeamsWithAI = async (
  players: Player[],
  apiKey: string,
  matchHistory: Match[] = [],
): Promise<AITeamSelectionResult> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error(
      'Invalid API key format. OpenAI API keys should start with "sk-"',
    );
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert sports analyst that can create balanced teams based on player statistics and historical performance. Your PRIMARY goal is to create two EQUALLY strong teams with balanced skill distribution. The teams should be as evenly matched as possible, ensuring fair competition.',
        },
        {
          role: 'user',
          content: `I need to create two perfectly balanced teams from these players. 
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
          ${matchHistory.length > 0 ? `And here's the match history data that might be useful for your analysis: ${JSON.stringify(matchHistory)}` : ''}`,
        },
      ],
    });

    if (
      !response ||
      !response.choices ||
      !response.choices[0] ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      throw new Error('Invalid or empty response from OpenAI');
    }

    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    if (
      !result.teamA ||
      !result.teamB ||
      !result.teamExplanation ||
      !result.playerAssessments
    ) {
      throw new Error(
        'Invalid response format from OpenAI. Missing required fields.',
      );
    }

    const assignedPlayers = [...result.teamA, ...result.teamB];
    let missingPlayers = false;

    if (assignedPlayers.length !== players.length) {
      missingPlayers = true;
    }

    const teamAPlayers = result.teamA
      .map((name: string) => {
        const player = players.find((p) => p.name === name);
        if (!player && missingPlayers) {
          return null;
        }
        return player;
      })
      .filter(Boolean);

    const teamBPlayers = result.teamB
      .map((name: string) => {
        const player = players.find((p) => p.name === name);
        if (!player && missingPlayers) {
          return null;
        }
        return player;
      })
      .filter(Boolean);

    return {
      teamA: teamAPlayers,
      teamB: teamBPlayers,
      teamExplanation: result.teamExplanation,
      playerAssessments: result.playerAssessments,
    };
  } catch (error) {
    console.error('Error using OpenAI for team selection:', error);

    let errorMessage = 'Error generating teams with AI';

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage =
          'Invalid OpenAI API key. Please check your key and try again.';
      } else if (error.message.includes('429')) {
        errorMessage =
          'OpenAI API rate limit exceeded. Please try again later.';
      } else if (error.message.includes('500')) {
        errorMessage = 'OpenAI API server error. Please try again later.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }

    throw new Error(errorMessage);
  }
};
