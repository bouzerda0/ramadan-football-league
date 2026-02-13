# Zone 01 Oujda Football League - Setup Guide

## Quick Setup (Recommended)

### Step 1: Create Project with Vite

```bash
# Create new Vite project
npm create vite@latest zone01-football -- --template react-ts

# Enter project
cd zone01-football

# Install dependencies
npm install

# Install additional packages
npm install lucide-react tailwind-merge clsx class-variance-authority @radix-ui/react-slot

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 2: Configure Tailwind

Replace `tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Step 3: Configure PostCSS

Replace `postcss.config.js` with:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 4: Configure TypeScript Paths

Add to `tsconfig.app.json` inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Step 5: Configure Vite

Replace `vite.config.ts` with:

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Step 6: Update index.css

Replace `src/index.css` with the full CSS file (see below).

### Step 7: Create Source Files

Create these directories and files:

```
src/
├── components/
│   ├── Navigation.tsx
│   └── ui/
│       └── button.tsx
├── sections/
│   ├── Hero.tsx
│   ├── MatchOfTheDay.tsx
│   ├── Standings.tsx
│   ├── PlayerStats.tsx
│   ├── Schedule.tsx
│   ├── RamadanSpirit.tsx
│   ├── Gallery.tsx
│   ├── PrayerTimes.tsx
│   └── Registration.tsx
├── context/
│   └── LanguageContext.tsx
├── hooks/
│   ├── useScrollReveal.ts
│   └── usePrayerTimes.ts
├── data/
│   └── leagueData.ts
├── types/
│   └── index.ts
├── lib/
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Step 8: Install and Run

```bash
npm install
npm run dev
```

---

## Push to GitHub

```bash
# Initialize git
git init

# Configure git (if not done)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Create .gitignore
echo "node_modules/\ndist/\n.cache/\n.env\n*.log" > .gitignore

# Add files
git add .

# Commit
git commit -m "Initial commit: Zone 01 Oujda Football League"

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/zone01-football.git
git push -u origin main
```

---

## Alternative: Clone from Template

If I push this to a public repository, you can simply:

```bash
git clone https://github.com/abouzerd/zone01-football.git
cd zone01-football
npm install
npm run dev
```

---

## Key Files You Need

### 1. `src/types/index.ts`
TypeScript interfaces for teams, players, matches, etc.

### 2. `src/data/leagueData.ts`
All team data, player stats, match results.

### 3. `src/context/LanguageContext.tsx`
Multilingual support (EN/FR/AR).

### 4. `src/index.css`
All styling with Ramadan theme.

### 5. Section components in `src/sections/`
Hero, Standings, Stats, Schedule, etc.

---

## Need Help?

If you want me to:
1. **Push directly to your GitHub** - Give me your username and a personal access token
2. **Create a public template repo** - I can create one you can fork
3. **Send files individually** - I can output each file content

Just let me know!
