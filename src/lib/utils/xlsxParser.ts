import { read, utils, type WorkBook } from 'xlsx';
import type { ParsedData, Player, Match } from './types';

interface PlayerStatsRow {
  __EMPTY?: string;
  __EMPTY_1?: string | number;
  __EMPTY_2?: string | number;
}

interface MatchHistoryRow {
  Datum?: string | number;
  'Tým 1'?: string | number;
  'Tým 2'?: string | number;
  'Hráči týmu 1'?: string;
  'Hráči týmu 2'?: string;
}

const excelDateToJSDate = (excelDate: number): Date => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(Math.round((excelDate - 25569) * millisecondsPerDay));
  return date;
};

const getStatsByName = (rows: PlayerStatsRow[]): Map<string, PlayerStatsRow> =>
  new Map(
    rows
      .filter((row) => row.__EMPTY)
      .map((row) => [row.__EMPTY!.trim().toLowerCase(), row]),
  );

export const processWorkbook = (workbook: WorkBook): ParsedData => {
  const scorersSheet = workbook.Sheets['Tabulka střelců'];
  const assistsSheet = workbook.Sheets['Tabulka nahrávek'];
  const pointsSheet = workbook.Sheets['Tabulka bodů'];

  const matchHistorySheet = workbook.Sheets['Výsledky zápasů'] || null;

  const scorersData = utils.sheet_to_json<PlayerStatsRow>(scorersSheet);
  const assistsData = utils.sheet_to_json<PlayerStatsRow>(assistsSheet);
  const pointsData = utils.sheet_to_json<PlayerStatsRow>(pointsSheet);
  const assistsByName = getStatsByName(assistsData);
  const pointsByName = getStatsByName(pointsData);

  const players: Player[] = scorersData.map((scorer) => {
    const name = scorer.__EMPTY?.trim() ?? '';
    const goals = Number(scorer.__EMPTY_2) || 0;
    const key = name.toLowerCase();
    const assists = Number(assistsByName.get(key)?.__EMPTY_2) || 0;
    const points = Number(pointsByName.get(key)?.__EMPTY_2) || 0;
    const matches = Number(scorer.__EMPTY_1) || 0;

    return {
      name,
      goals,
      assists,
      points,
      matches,
      goalsPerMatch: matches > 0 ? goals / matches : 0,
      assistsPerMatch: matches > 0 ? assists / matches : 0,
      pointsPerMatch: matches > 0 ? points / matches : 0,
    };
  });

  const filteredPlayers = players.filter(
    (player) => player.name && player.name !== 'Jméno' && player.matches > 0,
  );

  const matches: Match[] = [];

  if (matchHistorySheet) {
    const matchData = utils.sheet_to_json<MatchHistoryRow>(matchHistorySheet);
    const today = new Date();

    if (matchData.length > 0) {
      matchData.forEach((match) => {
        if (!match.Datum) {
          return;
        }

        const date =
          typeof match.Datum === 'number'
            ? excelDateToJSDate(match.Datum)
            : new Date(match.Datum);

        if (date > today) {
          return;
        }

        const team1Score =
          typeof match['Tým 1'] === 'number' ? match['Tým 1'] : 0;
        const team2Score =
          typeof match['Tým 2'] === 'number' ? match['Tým 2'] : 0;

        if (team1Score === 0 && team2Score === 0) {
          return;
        }

        const team1Players = match['Hráči týmu 1']
          ? match['Hráči týmu 1']
              .split(/[,;]/)
              .map((p: string) => p.trim())
              .filter(Boolean)
          : undefined;

        const team2Players = match['Hráči týmu 2']
          ? match['Hráči týmu 2']
              .split(/[,;]/)
              .map((p: string) => p.trim())
              .filter(Boolean)
          : undefined;

        matches.push({
          date,
          opponent: 'Team 2',
          team1Goals: team1Score,
          team2Goals: team2Score,
          team1Players,
          team2Players,
        });
      });
    }
  }

  return {
    players: filteredPlayers,
    matches,
  };
};

export const parseXlsxData = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        resolve(processWorkbook(read(data, { type: 'array' })));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
