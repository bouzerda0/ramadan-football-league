// UMPO Ramadan Football League 2026 - Data
// This file now serves as a fallback/initial state. Real data comes from the API.

import type { Team, Match, Player, PrayerTimes, WeatherData } from '@/types';

// Empty arrays - data will be loaded from API
export const teams: Team[] = [];

export const matches: Match[] = [];

export const prayerTimes: PrayerTimes = {
  date: new Date().toISOString().split('T')[0],
  fajr: '05:42',
  sunrise: '07:02',
  dhuhr: '13:15',
  asr: '16:42',
  maghrib: '19:08',
  isha: '20:28',
};

export const weatherData: WeatherData = {
  temp: 18,
  condition: 'Clear',
  wind: 12,
  humidity: 62,
};

// Helper functions - will work with API data
export const getTeamById = (id: string): Team | undefined => teams.find(t => t.id === id);

export const getPlayerById = (teamId: string, playerId: string): Player | undefined => {
  const team = getTeamById(teamId);
  return team?.squad.find(p => p.id === playerId);
};

export const getTopScorers = () => {
  const allPlayers = teams.flatMap(t => t.squad.map(p => ({ ...p, teamId: t.id, teamName: t.name })));
  return allPlayers
    .filter(p => p.stats.goals > 0)
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 10);
};

export const getTopAssists = () => {
  const allPlayers = teams.flatMap(t => t.squad.map(p => ({ ...p, teamId: t.id, teamName: t.name })));
  return allPlayers
    .filter(p => p.stats.assists > 0)
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 10);
};

export const getCleanSheets = () => {
  const allPlayers = teams.flatMap(t => t.squad.map(p => ({ ...p, teamId: t.id, teamName: t.name })));
  return allPlayers
    .filter(p => p.position === 'GK' && p.stats.cleanSheets > 0)
    .sort((a, b) => b.stats.cleanSheets - a.stats.cleanSheets);
};

export const getDisciplinary = () => {
  const allPlayers = teams.flatMap(t => t.squad.map(p => ({ ...p, teamId: t.id, teamName: t.name })));
  return allPlayers
    .filter(p => p.stats.yellowCards > 0 || p.stats.redCards > 0)
    .sort((a, b) => (b.stats.redCards * 3 + b.stats.yellowCards) - (a.stats.redCards * 3 + a.stats.yellowCards))
    .slice(0, 10);
};

export const getRamadanSpiritRanking = () => {
  return [...teams].sort((a, b) => b.stats.ramadanSpirit - a.stats.ramadanSpirit);
};
