// API Client for Ramadan Football League Backend (Go)

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function for API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// ============ Public API ============

export const getStatus = () => fetchAPI('/status');

export const getConfig = () => fetchAPI('/config');

export const getDashboard = () => fetchAPI('/dashboard');

export const getTeams = () => fetchAPI('/teams');

export const getTeam = (id: string) => fetchAPI(`/teams/${id}`);

export const getStandings = () => fetchAPI('/standings');

export const getMatches = (params?: { status?: string; matchday?: string; teamId?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.matchday) queryParams.append('matchday', params.matchday);
  if (params?.teamId) queryParams.append('teamId', params.teamId);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return fetchAPI(`/matches${query}`);
};

export const getMatch = (id: string) => fetchAPI(`/matches/${id}`);

export const getPlayers = (teamId?: string) => {
  const query = teamId ? `?teamId=${teamId}` : '';
  return fetchAPI(`/players${query}`);
};

export const getTopScorers = () => fetchAPI('/top-scorers');

// ============ Admin API ============

export const adminLogin = (username: string, password: string) =>
  fetchAPI('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

// Teams Admin
export const createTeam = (team: Partial<Team>) =>
  fetchAPI('/admin/teams', {
    method: 'POST',
    body: JSON.stringify(team),
  });

export const updateTeam = (id: string, team: Partial<Team>) =>
  fetchAPI(`/admin/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(team),
  });

export const deleteTeam = (id: string) =>
  fetchAPI(`/admin/teams/${id}`, {
    method: 'DELETE',
  });

export const generateTeams = (count: number) =>
  fetchAPI('/admin/teams/generate', {
    method: 'POST',
    body: JSON.stringify({ count }),
  });

// Players Admin
export const createPlayer = (player: Partial<Player>) =>
  fetchAPI('/admin/players', {
    method: 'POST',
    body: JSON.stringify(player),
  });

export const updatePlayer = (id: string, player: Partial<Player>) =>
  fetchAPI(`/admin/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(player),
  });

export const deletePlayer = (id: string) =>
  fetchAPI(`/admin/players/${id}`, {
    method: 'DELETE',
  });

// Matches Admin
export const createMatch = (match: Partial<Match>) =>
  fetchAPI('/admin/matches', {
    method: 'POST',
    body: JSON.stringify(match),
  });

export const updateMatch = (id: string, match: Partial<Match>) =>
  fetchAPI(`/admin/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(match),
  });

export const updateMatchScore = (id: string, homeScore: number, awayScore: number) =>
  fetchAPI(`/admin/matches/${id}/score`, {
    method: 'PUT',
    body: JSON.stringify({ homeScore, awayScore }),
  });

export const deleteMatch = (id: string) =>
  fetchAPI(`/admin/matches/${id}`, {
    method: 'DELETE',
  });

export const generateMatches = (startDate?: string) =>
  fetchAPI('/admin/matches/generate', {
    method: 'POST',
    body: JSON.stringify({ startDate }),
  });

// Config Admin
export const updateConfig = (config: Partial<SiteConfig>) =>
  fetchAPI('/admin/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });

// Reset
export const resetAll = () =>
  fetchAPI('/admin/reset/all', {
    method: 'POST',
  });

export const resetMatches = () =>
  fetchAPI('/admin/reset/matches', {
    method: 'POST',
  });

// Types (re-export for convenience)
import type { Team, Player, Match, SiteConfig } from '@/types';
