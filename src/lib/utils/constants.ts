export const PLAYER_SCORE_WEIGHTS = {
  goalWeight: 6,
  assistWeight: 4,
  pointWeight: 1,
} as const;

export const TEAM_BALANCE_WEIGHTS = {
  smallUnevenTeams: { skillWeight: 0.95, synergyWeight: 0.05 },
  standardTeams: { skillWeight: 0.9, synergyWeight: 0.1 },
} as const;

export const SKILL_ONLY_WEIGHTS = {
  skillWeight: 1,
  synergyWeight: 0,
} as const;

export const SMALL_TEAM_MAX_SIZE = 4;
export const SYNERGY_SMOOTHING_GAMES = 2;
export const MAX_SYNERGY_DIFF = 2;
export const TOP_COMBINATIONS_LIMIT = 10;
export const NEAR_OPTIMAL_SCORE_TOLERANCE = 0.01;

export const PLAYER_NAME_MAPPING: Record<string, string> = {
  David: 'Frič David',
  Dvaid: 'Frič David',
  Milan: 'Hurtík Milan',
  Viktor: 'Jurdič Viktor',
  Zbyněk: 'Laisek Zbyněk',
  Jirka: 'Matějka Jiří',
  Jiří: 'Matějka Jiří',
  Richard: 'Mišaga Richard',
  'Honza O.': 'Osička Jan',
  'Honza O': 'Osička Jan',
  'Honza T.': 'Tuček Jan',
  'Honza T': 'Tuček Jan',
  Honza: 'Osička Jan',
  Jan: 'Osička Jan',
  'Ondra Vá.': 'Vácha Ondra',
  'Ondra Va': 'Vácha Ondra',
  Ondra: 'Vácha Ondra',
  Petr: 'Rajtšlégr Petr',
  'Tomáš M.': 'Máka Tomáš',
  'Tomáš M': 'Máka Tomáš',
  Tomáš: 'Máka Tomáš',
  Luboš: 'Burdík Luboš',
  Martin: 'Anděl Martin',
};
