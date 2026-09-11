import { utils, WorkBook } from 'xlsx';

import { processWorkbook } from './xlsxParser';

const SHEET_NAMES = {
  scorers: 'Tabulka střelců',
  assists: 'Tabulka nahrávek',
  points: 'Tabulka bodů',
} as const;

const appendSheet = (
  workbook: WorkBook,
  name: string,
  rows: (string | number)[][],
) => {
  const sheet = utils.aoa_to_sheet([['', '', '', name], ...rows]);
  // Real exports leave the first-row header cells unset, which is what turns
  // the column keys into the __EMPTY names the parser reads.
  delete sheet.A1;
  delete sheet.B1;
  delete sheet.C1;
  utils.book_append_sheet(workbook, sheet, name);
};

describe('processWorkbook', () => {
  it('joins assists and points to players by name, not row order', () => {
    const workbook = utils.book_new();
    appendSheet(workbook, SHEET_NAMES.scorers, [
      ['Jméno', 'Zápasy', 'Góly'],
      ['Alice', 10, 5],
      ['Bob', 8, 2],
    ]);
    appendSheet(workbook, SHEET_NAMES.assists, [
      ['Jméno', 'Zápasy', 'Nahrávky'],
      ['Bob', 8, 7],
      ['Alice', 10, 1],
    ]);
    appendSheet(workbook, SHEET_NAMES.points, [
      ['Jméno', 'Zápasy', 'Body'],
      ['Bob', 8, 30],
      ['Alice', 10, 20],
    ]);

    const { players } = processWorkbook(workbook);

    expect(players).toEqual([
      expect.objectContaining({
        name: 'Alice',
        goals: 5,
        assists: 1,
        points: 20,
        matches: 10,
      }),
      expect.objectContaining({
        name: 'Bob',
        goals: 2,
        assists: 7,
        points: 30,
        matches: 8,
      }),
    ]);
  });

  it('defaults missing assists and points to zero', () => {
    const workbook = utils.book_new();
    appendSheet(workbook, SHEET_NAMES.scorers, [
      ['Jméno', 'Zápasy', 'Góly'],
      ['Alice', 10, 5],
    ]);
    appendSheet(workbook, SHEET_NAMES.assists, [
      ['Jméno', 'Zápasy', 'Nahrávky'],
    ]);
    appendSheet(workbook, SHEET_NAMES.points, [['Jméno', 'Zápasy', 'Body']]);

    const { players } = processWorkbook(workbook);

    expect(players).toEqual([
      expect.objectContaining({
        name: 'Alice',
        goals: 5,
        assists: 0,
        points: 0,
      }),
    ]);
  });
});
