import OpenAI from 'openai';

import { Player } from './xlsxParser';

export interface AITeamSelectionResult {
  teamA: Player[];
  teamB: Player[];
  teamExplanation: string;
  playerAssessments: Record<string, string>;
}

export const selectTeamsWithAI = async (
  players: Player[],
  apiKey: string,
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
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert sports analyst that can create balanced teams based on player statistics. Your goal is to create two equally strong teams.',
        },
        {
          role: 'user',
          content: `I need to create two balanced teams from these players. 
          Please analyze ALL their statistics thoroughly and form two teams that are as balanced and fair as possible.
          Use your expertise to determine which statistics are most important and how they should be weighted.
          Consider all aspects of player performance in your analysis.
          
          In addition to creating balanced teams, please provide:
          1. A brief explanation of your team selection strategy and how you balanced the teams
          2. A short assessment for each player describing their strengths and role in the team
          
          Return a JSON object with the following structure:
          {
            "teamA": ["Player Name 1", "Player Name 2", ...],
            "teamB": ["Player Name 3", "Player Name 4", ...],
            "teamExplanation": "Your explanation of the team selection strategy...",
            "playerAssessments": {
              "Player Name 1": "Brief assessment of this player's strengths and role...",
              "Player Name 2": "Brief assessment of this player's strengths and role...",
              ...and so on for all players
            }
          }
          
          Here's the complete player data: ${JSON.stringify(players)}`,
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
