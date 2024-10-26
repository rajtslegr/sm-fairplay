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

export const processWorkbook = (workbook: any): Player[] => {
  const scorersSheet = workbook.Sheets['Tabulka střelců'];
  const assistsSheet = workbook.Sheets['Tabulka nahrávek'];
  const pointsSheet = workbook.Sheets['Tabulka bodů'];

  const scorersData = utils.sheet_to_json(scorersSheet);
  const assistsData = utils.sheet_to_json(assistsSheet);
  const pointsData = utils.sheet_to_json(pointsSheet);

  const players: Player[] = scorersData.map((scorer: any, index: number) => {
    const name = scorer.__EMPTY;
    const goals = Number(scorer.__EMPTY_2) || 0;
    const assists = Number((assistsData[index] as any)?.__EMPTY_2) || 0;
    const points = Number((pointsData[index] as any)?.__EMPTY_2) || 0;
    const matches = Number(scorer.__EMPTY_1) || 1;

    return {
      name,
      goals,
      assists,
      points,
      matches,
      goalsPerMatch: goals / matches,
      assistsPerMatch: assists / matches,
      pointsPerMatch: points / matches,
    };
  });

  return players.filter((player) => player.name && player.name !== 'Jméno');
};

export const parseXlsxData = (file: File): Promise<Player[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });

      const players = processWorkbook(workbook);
      resolve(players);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
