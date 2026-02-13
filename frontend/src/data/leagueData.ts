// Zone 01 Oujda Ramadan Football League 2026 - Data

import type { Team, Match, Player, PrayerTimes, WeatherData } from '@/types';

export const teams: Team[] = [
  {
    id: 'team1',
    name: 'Al-Mountakhab',
    shortName: 'AMT',
    logo: '/images/teams/al-mountakhab.png',
    cohort: 'Cohort A',
    captain: 'Youssef El Amrani',
    motto: 'Excellence in Every Step',
    colors: { primary: '#D4A018', secondary: '#0B0F1C' },
    squad: [
      { id: 'p1', name: 'Karim Benali', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 2, matchesPlayed: 4 } },
      { id: 'p2', name: 'Omar Haddad', number: 4, position: 'DEF', stats: { goals: 0, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p3', name: 'Amine Tahiri', number: 5, position: 'DEF', stats: { goals: 1, assists: 0, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p4', name: 'Said Moussaoui', number: 8, position: 'MID', stats: { goals: 2, assists: 3, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p5', name: 'Youssef El Amrani', number: 10, position: 'MID', isCaptain: true, stats: { goals: 7, assists: 4, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p6', name: 'Mehdi Fassi', number: 7, position: 'FWD', stats: { goals: 3, assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p7', name: 'Hamza Idrissi', number: 9, position: 'FWD', stats: { goals: 4, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p8', name: 'Rachid Bennani', number: 2, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p9', name: 'Adil Cherkaoui', number: 6, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p10', name: 'Nabil Draoui', number: 11, position: 'FWD', isSubstitute: true, stats: { goals: 1, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p11', name: 'Khalid Fikri', number: 12, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 18, goalsAgainst: 6, goalDifference: 12, points: 10, form: ['W', 'W', 'D', 'W'], ramadanSpirit: 86 },
    qrCode: 'https://zone01-oujda.ma/teams/al-mountakhab',
  },
  {
    id: 'team2',
    name: 'Les Aigles',
    shortName: 'AIG',
    logo: '/images/teams/les-aigles.png',
    cohort: 'Cohort B',
    captain: 'Ahmed El Fassi',
    motto: 'Sky is the Limit',
    colors: { primary: '#10B981', secondary: '#F4F6FA' },
    squad: [
      { id: 'p12', name: 'Yassin Ait', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 1, matchesPlayed: 4 } },
      { id: 'p13', name: 'Reda Benjelloun', number: 3, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p14', name: 'Walid Khouya', number: 4, position: 'DEF', stats: { goals: 1, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p15', name: 'Samir Lahcen', number: 6, position: 'MID', stats: { goals: 1, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p16', name: 'Ahmed El Fassi', number: 10, position: 'MID', isCaptain: true, stats: { goals: 4, assists: 3, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p17', name: 'Hicham Ouarzazi', number: 9, position: 'FWD', stats: { goals: 3, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p18', name: 'Mustapha Rami', number: 11, position: 'FWD', stats: { goals: 2, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p19', name: 'Brahim Sbai', number: 2, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p20', name: 'Driss Tazi', number: 7, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p21', name: 'Fouad Zahir', number: 8, position: 'FWD', isSubstitute: true, stats: { goals: 1, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p22', name: 'Jawad Alami', number: 5, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 12, goalsAgainst: 8, goalDifference: 4, points: 7, form: ['W', 'L', 'D', 'W'], ramadanSpirit: 90 },
    qrCode: 'https://zone01-oujda.ma/teams/les-aigles',
  },
  {
    id: 'team3',
    name: 'Al-Wahda',
    shortName: 'WAH',
    logo: '/images/teams/al-wahda.png',
    cohort: 'Cohort C',
    captain: 'Karim Alami',
    motto: 'Unity is Strength',
    colors: { primary: '#3B82F6', secondary: '#FFFFFF' },
    squad: [
      { id: 'p23', name: 'Noureddine Bahi', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 1, matchesPlayed: 4 } },
      { id: 'p24', name: 'Ayoub Daoudi', number: 2, position: 'DEF', stats: { goals: 0, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p25', name: 'Zakaria El Haddad', number: 5, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p26', name: 'Imad Fattah', number: 8, position: 'MID', stats: { goals: 2, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p27', name: 'Karim Alami', number: 10, position: 'MID', isCaptain: true, stats: { goals: 3, assists: 3, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p28', name: 'Rachid Ghellab', number: 9, position: 'FWD', stats: { goals: 2, assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p29', name: 'Salim Hajji', number: 11, position: 'FWD', stats: { goals: 1, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p30', name: 'Tarik Ibrahimi', number: 3, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p31', name: 'Younes Jaafari', number: 6, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p32', name: 'Aziz Kadiri', number: 7, position: 'FWD', isSubstitute: true, stats: { goals: 1, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p33', name: 'Bilal Massoudi', number: 4, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 4, won: 2, drawn: 0, lost: 2, goalsFor: 9, goalsAgainst: 10, goalDifference: -1, points: 6, form: ['L', 'W', 'W', 'L'], ramadanSpirit: 92 },
    qrCode: 'https://zone01-oujda.ma/teams/al-wahda',
  },
  {
    id: 'team4',
    name: 'Al-Amal',
    shortName: 'AML',
    logo: '/images/teams/al-amal.png',
    cohort: 'Cohort D',
    captain: 'Hassan Benbrahim',
    motto: 'Hope Never Dies',
    colors: { primary: '#EF4444', secondary: '#F4F6FA' },
    squad: [
      { id: 'p34', name: 'Latif Akharaz', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 1, matchesPlayed: 4 } },
      { id: 'p35', name: 'Mounir Belfkih', number: 3, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p36', name: 'Ouail Daki', number: 4, position: 'DEF', stats: { goals: 0, assists: 1, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p37', name: 'Parfait Essaid', number: 6, position: 'MID', stats: { goals: 1, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p38', name: 'Hassan Benbrahim', number: 10, position: 'MID', isCaptain: true, stats: { goals: 2, assists: 3, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p39', name: 'Qassim Fkih', number: 9, position: 'FWD', stats: { goals: 2, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p40', name: 'Rida Ghazali', number: 11, position: 'FWD', stats: { goals: 1, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p41', name: 'Sami Hafidi', number: 2, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p42', name: 'Tariq Idrissi', number: 7, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p43', name: 'Umar Jazouli', number: 8, position: 'FWD', isSubstitute: true, stats: { goals: 1, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p44', name: 'Victor Kabbaj', number: 5, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 4, won: 1, drawn: 2, lost: 1, goalsFor: 7, goalsAgainst: 7, goalDifference: 0, points: 5, form: ['D', 'W', 'D', 'L'], ramadanSpirit: 96 },
    qrCode: 'https://zone01-oujda.ma/teams/al-amal',
  },
  {
    id: 'team5',
    name: 'Al-Quds',
    shortName: 'QDS',
    logo: '/images/teams/al-quds.png',
    cohort: 'Cohort E',
    captain: 'Omar Lahlou',
    motto: 'Pride of the City',
    colors: { primary: '#8B5CF6', secondary: '#F4F6FA' },
    squad: [
      { id: 'p45', name: 'Wassim Laaroussi', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p46', name: 'Xavier Mahfoud', number: 2, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p47', name: 'Yahya Naciri', number: 4, position: 'DEF', stats: { goals: 0, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p48', name: 'Zouhair Oufkir', number: 8, position: 'MID', stats: { goals: 1, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p49', name: 'Omar Lahlou', number: 10, position: 'MID', isCaptain: true, stats: { goals: 2, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p50', name: 'Patrick Moussaoui', number: 9, position: 'FWD', stats: { goals: 1, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p51', name: 'Quentin Naamani', number: 11, position: 'FWD', stats: { goals: 0, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p52', name: 'Rachid Oubaha', number: 3, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p53', name: 'Simon Qorchi', number: 6, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p54', name: 'Thomas Rhani', number: 7, position: 'FWD', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p55', name: 'Ugo Sefrioui', number: 5, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 4, won: 1, drawn: 1, lost: 2, goalsFor: 4, goalsAgainst: 8, goalDifference: -4, points: 4, form: ['L', 'D', 'L', 'W'], ramadanSpirit: 94 },
    qrCode: 'https://zone01-oujda.ma/teams/al-quds',
  },
  {
    id: 'team6',
    name: 'Al-Fajr',
    shortName: 'FAJ',
    logo: '/images/teams/al-fajr.png',
    cohort: 'Cohort F',
    captain: 'Nabil Tazi',
    motto: 'New Dawn, New Victory',
    colors: { primary: '#F59E0B', secondary: '#0B0F1C' },
    squad: [
      { id: 'p56', name: 'Ahmed Ulad', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p57', name: 'Badr Vally', number: 2, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p58', name: 'Chakib Wattar', number: 4, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p59', name: 'Driss Xoubi', number: 6, position: 'MID', stats: { goals: 0, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p60', name: 'Nabil Tazi', number: 10, position: 'MID', isCaptain: true, stats: { goals: 2, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p61', name: 'Fadel Yamani', number: 9, position: 'FWD', stats: { goals: 1, assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p62', name: 'Ghani Zouine', number: 11, position: 'FWD', stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
      { id: 'p63', name: 'Hakim Aabboud', number: 3, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p64', name: 'Ismail Belfqih', number: 7, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p65', name: 'Jamal Chafik', number: 8, position: 'FWD', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p66', name: 'Karim Dahbi', number: 5, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 4, won: 0, drawn: 2, lost: 2, goalsFor: 3, goalsAgainst: 9, goalDifference: -6, points: 2, form: ['D', 'L', 'D', 'L'], ramadanSpirit: 88 },
    qrCode: 'https://zone01-oujda.ma/teams/al-fajr',
  },
  {
    id: 'team7',
    name: 'Al-Nasr',
    shortName: 'NSR',
    logo: '/images/teams/al-nasr.png',
    cohort: 'Cohort G',
    captain: 'Younes El Khatib',
    motto: 'Victory Through Unity',
    colors: { primary: '#06B6D4', secondary: '#0B0F1C' },
    squad: [
      { id: 'p67', name: 'Anas El Fathi', number: 1, position: 'GK', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 1, matchesPlayed: 3 } },
      { id: 'p68', name: 'Bilal Guedira', number: 2, position: 'DEF', stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p69', name: 'Chafik Haddou', number: 4, position: 'DEF', stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p70', name: 'Driss Idrissi', number: 6, position: 'MID', stats: { goals: 1, assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p71', name: 'Younes El Khatib', number: 10, position: 'MID', isCaptain: true, stats: { goals: 3, assists: 2, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p72', name: 'Fahd Moussaoui', number: 9, position: 'FWD', stats: { goals: 2, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p73', name: 'Ghali Ouazzani', number: 11, position: 'FWD', stats: { goals: 1, assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 3 } },
      { id: 'p74', name: 'Hakim Rhani', number: 3, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
      { id: 'p75', name: 'Ilyas Sefrioui', number: 7, position: 'MID', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 2 } },
      { id: 'p76', name: 'Jalal Tahiri', number: 8, position: 'FWD', isSubstitute: true, stats: { goals: 0, assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
      { id: 'p77', name: 'Karim Zouine', number: 5, position: 'DEF', isSubstitute: true, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1 } },
    ],
    stats: { played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 7, goalsAgainst: 4, goalDifference: 3, points: 6, form: ['W', 'L', 'W'], ramadanSpirit: 91 },
    qrCode: 'https://zone01-oujda.ma/teams/al-nasr',
  },
];

export const matches: Match[] = [
  // Matchday 1
  { id: 'm1', matchday: 1, date: '2026-03-28', time: '19:30', venue: 'Pitch A', homeTeamId: 'team1', awayTeamId: 'team2', homeScore: 3, awayScore: 1, status: 'finished', events: [
    { id: 'e1', minute: 12, type: 'goal', playerId: 'p5', teamId: 'team1', description: 'Youssef El Amrani scores' },
    { id: 'e2', minute: 28, type: 'goal', playerId: 'p6', teamId: 'team1', assistPlayerId: 'p5', description: 'Mehdi Fassi scores' },
    { id: 'e3', minute: 45, type: 'yellowCard', playerId: 'p13', teamId: 'team2', description: 'Reda Benjelloun yellow card' },
    { id: 'e4', minute: 62, type: 'goal', playerId: 'p16', teamId: 'team2', description: 'Ahmed El Fassi scores' },
    { id: 'e5', minute: 78, type: 'goal', playerId: 'p7', teamId: 'team1', assistPlayerId: 'p4', description: 'Hamza Idrissi scores' },
  ], mvp: 'p5' },
  { id: 'm2', matchday: 1, date: '2026-03-28', time: '20:15', venue: 'Pitch B', homeTeamId: 'team3', awayTeamId: 'team4', homeScore: 2, awayScore: 1, status: 'finished', events: [
    { id: 'e6', minute: 8, type: 'goal', playerId: 'p27', teamId: 'team3', description: 'Karim Alami scores' },
    { id: 'e7', minute: 34, type: 'goal', playerId: 'p39', teamId: 'team4', description: 'Qassim Fkih scores' },
    { id: 'e8', minute: 71, type: 'goal', playerId: 'p26', teamId: 'team3', assistPlayerId: 'p27', description: 'Imad Fattah scores' },
  ], mvp: 'p27' },
  { id: 'm3', matchday: 1, date: '2026-03-28', time: '21:00', venue: 'Pitch A', homeTeamId: 'team5', awayTeamId: 'team6', homeScore: 1, awayScore: 1, status: 'finished', events: [
    { id: 'e9', minute: 23, type: 'goal', playerId: 'p49', teamId: 'team5', description: 'Omar Lahlou scores' },
    { id: 'e10', minute: 67, type: 'goal', playerId: 'p60', teamId: 'team6', description: 'Nabil Tazi scores' },
  ], mvp: 'p49' },
  { id: 'm3b', matchday: 1, date: '2026-03-28', time: '21:45', venue: 'Pitch B', homeTeamId: 'team1', awayTeamId: 'team7', homeScore: 2, awayScore: 1, status: 'finished', events: [
    { id: 'e10b', minute: 15, type: 'goal', playerId: 'p5', teamId: 'team1', description: 'Youssef El Amrani scores' },
    { id: 'e10c', minute: 42, type: 'goal', playerId: 'p71', teamId: 'team7', description: 'Younes El Khatib scores' },
    { id: 'e10d', minute: 78, type: 'goal', playerId: 'p7', teamId: 'team1', description: 'Hamza Idrissi scores' },
  ], mvp: 'p5' },
  
  // Matchday 2
  { id: 'm4', matchday: 2, date: '2026-03-30', time: '19:30', venue: 'Pitch A', homeTeamId: 'team2', awayTeamId: 'team3', homeScore: 2, awayScore: 0, status: 'finished', events: [
    { id: 'e11', minute: 15, type: 'goal', playerId: 'p16', teamId: 'team2', description: 'Ahmed El Fassi scores' },
    { id: 'e12', minute: 44, type: 'goal', playerId: 'p17', teamId: 'team2', assistPlayerId: 'p16', description: 'Hicham Ouarzazi scores' },
  ], mvp: 'p16' },
  { id: 'm5', matchday: 2, date: '2026-03-30', time: '20:15', venue: 'Pitch B', homeTeamId: 'team4', awayTeamId: 'team5', homeScore: 2, awayScore: 0, status: 'finished', events: [
    { id: 'e13', minute: 19, type: 'goal', playerId: 'p38', teamId: 'team4', description: 'Hassan Benbrahim scores' },
    { id: 'e14', minute: 56, type: 'goal', playerId: 'p40', teamId: 'team4', assistPlayerId: 'p38', description: 'Rida Ghazali scores' },
  ], mvp: 'p38' },
  { id: 'm6', matchday: 2, date: '2026-03-30', time: '21:00', venue: 'Pitch A', homeTeamId: 'team6', awayTeamId: 'team1', homeScore: 1, awayScore: 4, status: 'finished', events: [
    { id: 'e15', minute: 5, type: 'goal', playerId: 'p5', teamId: 'team1', description: 'Youssef El Amrani scores' },
    { id: 'e16', minute: 22, type: 'goal', playerId: 'p7', teamId: 'team1', assistPlayerId: 'p5', description: 'Hamza Idrissi scores' },
    { id: 'e17', minute: 38, type: 'goal', playerId: 'p5', teamId: 'team1', description: 'Youssef El Amrani scores' },
    { id: 'e18', minute: 51, type: 'goal', playerId: 'p60', teamId: 'team6', description: 'Nabil Tazi scores' },
    { id: 'e19', minute: 73, type: 'goal', playerId: 'p6', teamId: 'team1', description: 'Mehdi Fassi scores' },
  ], mvp: 'p5' },
  
  // Matchday 3
  { id: 'm7', matchday: 3, date: '2026-04-01', time: '19:30', venue: 'Pitch A', homeTeamId: 'team1', awayTeamId: 'team3', homeScore: 4, awayScore: 2, status: 'finished', events: [
    { id: 'e20', minute: 11, type: 'goal', playerId: 'p5', teamId: 'team1', description: 'Youssef El Amrani scores' },
    { id: 'e21', minute: 29, type: 'goal', playerId: 'p27', teamId: 'team3', description: 'Karim Alami scores' },
    { id: 'e22', minute: 44, type: 'goal', playerId: 'p7', teamId: 'team1', assistPlayerId: 'p4', description: 'Hamza Idrissi scores' },
    { id: 'e23', minute: 58, type: 'goal', playerId: 'p5', teamId: 'team1', description: 'Youssef El Amrani scores' },
    { id: 'e24', minute: 71, type: 'goal', playerId: 'p29', teamId: 'team3', description: 'Salim Hajji scores' },
    { id: 'e25', minute: 86, type: 'goal', playerId: 'p4', teamId: 'team1', description: 'Said Moussaoui scores' },
  ], mvp: 'p5' },
  { id: 'm8', matchday: 3, date: '2026-04-01', time: '20:15', venue: 'Pitch B', homeTeamId: 'team2', awayTeamId: 'team5', homeScore: 3, awayScore: 1, status: 'finished', events: [
    { id: 'e26', minute: 17, type: 'goal', playerId: 'p17', teamId: 'team2', description: 'Hicham Ouarzazi scores' },
    { id: 'e27', minute: 33, type: 'goal', playerId: 'p16', teamId: 'team2', description: 'Ahmed El Fassi scores' },
    { id: 'e28', minute: 49, type: 'goal', playerId: 'p50', teamId: 'team5', description: 'Omar Lahlou scores' },
    { id: 'e29', minute: 77, type: 'goal', playerId: 'p18', teamId: 'team2', assistPlayerId: 'p16', description: 'Mustapha Rami scores' },
  ], mvp: 'p16' },
  { id: 'm9', matchday: 3, date: '2026-04-01', time: '21:00', venue: 'Pitch A', homeTeamId: 'team4', awayTeamId: 'team6', homeScore: 1, awayScore: 1, status: 'finished', events: [
    { id: 'e30', minute: 14, type: 'goal', playerId: 'p43', teamId: 'team4', description: 'Umar Jazouli scores' },
    { id: 'e31', minute: 68, type: 'goal', playerId: 'p61', teamId: 'team6', description: 'Fadel Yamani scores' },
  ], mvp: 'p43' },
  
  // Semi-finals
  { id: 'm10', matchday: 4, date: '2026-04-03', time: '19:30', venue: 'Pitch A', homeTeamId: 'team1', awayTeamId: 'team4', status: 'scheduled' },
  { id: 'm11', matchday: 4, date: '2026-04-03', time: '21:00', venue: 'Pitch A', homeTeamId: 'team2', awayTeamId: 'team3', status: 'scheduled' },
  
  // Final
  { id: 'm12', matchday: 5, date: '2026-04-05', time: '20:00', venue: 'Pitch A', homeTeamId: '', awayTeamId: '', status: 'scheduled' },
];

export const prayerTimes: PrayerTimes = {
  date: '2026-03-28',
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
