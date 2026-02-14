
import Navigation from '@/components/Navigation';
import Hero from '@/sections/Hero';
import MatchOfTheDay from '@/sections/MatchOfTheDay';
import Standings from '@/sections/Standings';
import PlayerStats from '@/sections/PlayerStats';
import Schedule from '@/sections/Schedule';
import Gallery from '@/sections/Gallery';
import PrayerTimes from '@/sections/PrayerTimes';
import Registration from '@/sections/Registration';
import TournamentBracket from '@/sections/TournamentBracket';

export default function Home() {
    return (
        <>
            <Navigation />

            {/* Main Content */}
            <main>
                {/* Hero Section - Tournament Bracket */}
                <Hero />

                {/* Match of the Day */}
                {/* Match of the Day */}
                <MatchOfTheDay />

                {/* Tournament Bracket */}
                <TournamentBracket />

                {/* Standings Table */}
                <Standings />

                {/* Player Statistics */}
                <PlayerStats />

                {/* Schedule */}
                <Schedule />



                {/* Gallery */}
                <Gallery />

                {/* Prayer Times & Weather */}
                <PrayerTimes />

                {/* Registration & Footer */}
                <Registration />
            </main>
        </>
    );
}
