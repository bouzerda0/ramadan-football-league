import { LanguageProvider } from '@/context/LanguageContext';
import Navigation from '@/components/Navigation';
import Hero from '@/sections/Hero';
import MatchOfTheDay from '@/sections/MatchOfTheDay';
import Standings from '@/sections/Standings';
import PlayerStats from '@/sections/PlayerStats';
import Schedule from '@/sections/Schedule';
import RamadanSpirit from '@/sections/RamadanSpirit';
import Gallery from '@/sections/Gallery';
import PrayerTimes from '@/sections/PrayerTimes';
import Registration from '@/sections/Registration';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#0B0F1C] text-[#F4F6FA] overflow-x-hidden">
        {/* Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <main>
          {/* Hero Section - Tournament Bracket */}
          <Hero />
          
          {/* Match of the Day */}
          <MatchOfTheDay />
          
          {/* Standings Table */}
          <Standings />
          
          {/* Player Statistics */}
          <PlayerStats />
          
          {/* Schedule */}
          <Schedule />
          
          {/* Ramadan Spirit Leaderboard */}
          <RamadanSpirit />
          
          {/* Gallery */}
          <Gallery />
          
          {/* Prayer Times & Weather */}
          <PrayerTimes />
          
          {/* Registration & Footer */}
          <Registration />
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
