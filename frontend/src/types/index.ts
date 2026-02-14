// Zone 01 Oujda Ramadan Football League 2026 - Types

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  cohort: string;
  captain: string;
  motto: string;
  colors: {
    primary: string;
    secondary: string;
  };
  squad: Player[];
  stats: TeamStats;
  qrCode: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  isCaptain?: boolean;
  isSubstitute?: boolean;
  stats: PlayerStats;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  matchesPlayed: number;
}

export interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  ramadanSpirit: number;
}

export interface Match {
  id: string;
  matchday: number;
  date: string;
  time: string;
  venue: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  events?: MatchEvent[];
  mvp?: string;
  lineup?: {
    home: string[];
    away: string[];
  };
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution';
  playerId: string;
  teamId: string;
  assistPlayerId?: string;
  description: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  wind: number;
  humidity: number;
}

export interface FantasyTeam {
  id: string;
  ownerName: string;
  teamName: string;
  selectedPlayers: string[];
  totalPoints: number;
}

export type Language = 'ar' | 'fr' | 'en';

export interface Translations {
  [key: string]: {
    ar: string;
    fr: string;
    en: string;
  };
}

export interface BackendPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  isCaptain: boolean;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  matchesPlayed: number;
}

export interface BackendTeam {
  id: string;
  teamName: string;
  captainName: string;
  logoPath: string;
  players?: BackendPlayer[];
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
  form?: string[];
  ramadanSpirit?: number;
}
