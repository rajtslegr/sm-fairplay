import { calculatePlayerScore } from './teamSelection';
import { Match, Player } from './xlsxParser';

const serializeJson = (value: unknown): string => JSON.stringify(value);

const buildReturnFormatInstruction = (): string => {
  return `Return ONLY plain text in the EXACT output format below.

Hard rules:
- Do NOT output JSON.
- Do NOT output Markdown.
- Do NOT wrap the answer in a code block.
- Use the same emojis, punctuation, bullets, indentation, and line breaks.
- Round all numeric values to 2 decimals.
- Do NOT change the teams. The teams are already computed. Just provide assessments.

Scoring:
- PlayerScore = (GoalsPerMatch * 6) + (AssistsPerMatch * 4) + (PointsPerMatch * 1)
- Team Total Score = sum of PlayerScore for all players in that team

Game format:
- If both teams have 3 players each: 3v3
- If both teams have 4 players each: 4v4
- If teams are uneven (e.g. 4v3, 5v4): the larger team rotates one player in/out

Exact output template (fill in real values, keep the teams unchanged):

🤖 TEAM STRATEGY & ASSESSMENTS 🤖
<explain the game format (3v3/4v4) and rotation if teams are uneven>
<explain why these teams are balanced based on scores>

🟢 Total Score: <TeamA_TotalScore>

• <Player Name>
  Score: <PlayerScore> | Goals: <GoalsPerMatch> | Assists: <AssistsPerMatch> | Points: <PointsPerMatch>
  Assessment: <why this player fits this team, cite stats and match history>

• <Player Name>
  Score: ...
  Assessment: ...

🔴 Total Score: <TeamB_TotalScore>

• <Player Name>
  Score: ...
  Assessment: ...`;
};

const buildAssessmentRequest = (): string => {
  return `I have already computed two balanced teams using an algorithm. Your task is to provide player assessments and strategy explanation.

For each player, write 1-3 sentences explaining:
1) Why they fit their team (cite their stats)
2) How they complement their teammates
3) If match history is provided, reference relevant past performances

Also explain:
1) The game format (3v3 or 4v4 based on the smaller team)
2) If teams are uneven, which team rotates
3) Why the teams are balanced despite the score difference

Do NOT change the team assignments. The algorithm already optimized for balance.`;
};

export const buildPromptFromTeams = (options: {
  teamA: Player[];
  teamB: Player[];
  matchHistory?: Match[];
}): string => {
  const matchHistory = options.matchHistory ?? [];

  const teamAScore = options.teamA.reduce(
    (sum, p) => sum + calculatePlayerScore(p),
    0,
  );
  const teamBScore = options.teamB.reduce(
    (sum, p) => sum + calculatePlayerScore(p),
    0,
  );

  const formatPlayerData = (player: Player): string => {
    return `${player.name} (Goals/Match: ${player.goalsPerMatch.toFixed(2)}, Assists/Match: ${player.assistsPerMatch.toFixed(2)}, Points/Match: ${player.pointsPerMatch.toFixed(2)}, Score: ${calculatePlayerScore(player).toFixed(2)})`;
  };

  const teamAPlayers = options.teamA.map(formatPlayerData).join(', ');
  const teamBPlayers = options.teamB.map(formatPlayerData).join(', ');

  const userPromptParts = [
    buildAssessmentRequest(),
    buildReturnFormatInstruction(),
    `Team A (Total Score: ${teamAScore.toFixed(2)}): ${teamAPlayers}`,
    `Team B (Total Score: ${teamBScore.toFixed(2)}): ${teamBPlayers}`,
  ];

  if (matchHistory.length > 0) {
    userPromptParts.push(`Match history: ${serializeJson(matchHistory)}`);
  }

  const userPrompt = userPromptParts.join('\n\n');

  return `You are a sports analyst. Analyze these pre-computed teams and provide player assessments.\n\nUSER:\n${userPrompt}`;
};
