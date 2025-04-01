/* eslint-disable no-underscore-dangle */
import { read, utils } from 'xlsx';

export interface Player {
  name: string;
  goals: number;
  assists: number;
  points: number;
  matches: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  pointsPerMatch: number;
}

export interface Match {
  date: Date;
  opponent: string;
  team1Goals: number;
  team2Goals: number;
  team1Players?: string[];
  team2Players?: string[];
}

export interface ParsedData {
  players: Player[];
  matches: Match[];
}

const excelDateToJSDate = (excelDate: number): Date => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(Math.round((excelDate - 25569) * millisecondsPerDay));
  return date;
};

export const processWorkbook = (workbook: any): ParsedData => {
  const scorersSheet = workbook.Sheets['Tabulka střelců'];
  const assistsSheet = workbook.Sheets['Tabulka nahrávek'];
  const pointsSheet = workbook.Sheets['Tabulka bodů'];

  const matchHistorySheet = workbook.Sheets['Výsledky zápasů'] || null;

  const scorersData = utils.sheet_to_json(scorersSheet);
  const assistsData = utils.sheet_to_json(assistsSheet);
  const pointsData = utils.sheet_to_json(pointsSheet);

  const players: Player[] = scorersData.map((scorer: any, index: number) => {
    const name = scorer.__EMPTY;
    const goals = Number(scorer.__EMPTY_2) || 0;
    const assists = Number((assistsData[index] as any)?.__EMPTY_2) || 0;
    const points = Number((pointsData[index] as any)?.__EMPTY_2) || 0;
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
    const matchData = utils.sheet_to_json(matchHistorySheet);
    const today = new Date();

    if (matchData.length > 0) {
      matchData.forEach((match: any) => {
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
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });

      const parsedData = processWorkbook(workbook);
      resolve(parsedData);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
