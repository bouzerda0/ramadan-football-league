# Zone 01 Oujda Ramadan Football League 2026

A modern, responsive website for the Zone 01 Oujda school football tournament during Ramadan.

![Screenshot](screenshot.png)

## Features

- **Tournament Bracket** - Visual bracket showing all 6 teams
- **Live Standings** - Dynamic table with points, goal difference, form
- **Player Statistics** - Top scorers, assists, clean sheets, cards
- **Match Schedule** - Complete fixtures with results
- **Ramadan Spirit Leaderboard** - Fair play rankings
- **Prayer Times** - Oujda prayer schedule with Iftar countdown
- **Weather Widget** - Current conditions for match planning
- **Multilingual** - English, French, and Arabic (RTL support)
- **Responsive Design** - Works on all devices

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Quick Start

```bash
# Clone the repository
git clone https://github.com/abouzerd/zone01-football.git

# Enter project
cd zone01-football

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/       # UI components
│   ├── Navigation.tsx
│   └── ui/          # shadcn/ui components
├── sections/        # Page sections
│   ├── Hero.tsx
│   ├── Standings.tsx
│   ├── PlayerStats.tsx
│   ├── Schedule.tsx
│   ├── RamadanSpirit.tsx
│   ├── Gallery.tsx
│   ├── PrayerTimes.tsx
│   └── Registration.tsx
├── context/         # React context
│   └── LanguageContext.tsx
├── hooks/           # Custom hooks
│   ├── useScrollReveal.ts
│   └── usePrayerTimes.ts
├── data/            # Data files
│   └── leagueData.ts
├── types/           # TypeScript types
│   └── index.ts
├── lib/             # Utilities
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Adding a Team

Edit `src/data/leagueData.ts` and add a new team object to the `teams` array:

```typescript
{
  id: 'team7',
  name: 'Al-Nasr',
  shortName: 'NSR',
  cohort: 'Cohort G',
  captain: 'Younes El Khatib',
  motto: 'Victory Through Unity',
  colors: { primary: '#06B6D4', secondary: '#0B0F1C' },
  squad: [/* 16 players */],
  stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [], ramadanSpirit: 90 },
  qrCode: 'https://zone01-oujda.ma/teams/al-nasr',
}
```

## License

MIT License - Feel free to use for your own tournaments!

---

Made with ❤️ for Zone 01 Oujda
