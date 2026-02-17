import { useEffect, useState, useRef } from 'react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { ChevronDown, Moon, Star, Trophy } from 'lucide-react';
import type { Team } from '@/types';

// ... (keep imports)

export default function Hero() {
  const { dir } = useLanguage();
  const { timeToIftar } = usePrayerTimes();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // ... (keep data fetching logic, but ensure we have enough teams for the bracket)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_URL}/api/teams`);
        if (res.ok) {
          const json = await res.json();
          const data = Array.isArray(json) ? json : (json.data || []);

          // Map and pad teams similar to before but maybe 8 for a quarter-final look?
          // For now, stick to 6 or 8 top teams.
          const mappedTeams = data.map((t: any) => ({
            // ... map logic
            id: t.id,
            name: t.teamName,
            shortName: t.teamName?.substring(0, 3).toUpperCase() || 'UNK',
            logo: t.logoPath || '',
            colors: { primary: '#FACC15', secondary: '#040710' } // Default gold
          }));
          setTeams(mappedTeams.slice(0, 8)); // Grab top 8
        }
      } catch (e) {
        console.error("Hero fetch error", e);
      }
      setIsLoaded(true);
    };
    fetchTeams();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-[#040710] flex flex-col justify-center" dir={dir}>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0D1321] via-[#040710] to-[#000000]" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      {/* Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FACC15]/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[128px] animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center">

        {/* League Badge / Title */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 backdrop-blur-md mb-6 shadow-[0_0_20px_-5px_rgba(250,204,21,0.3)]">
            <Star className="w-4 h-4 text-[#FACC15] fill-current animate-spin-slow" />
            <span className="text-sm font-bold text-[#FACC15] tracking-widest uppercase">Ramadan Football League 2026</span>
          </div>
          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-white tracking-tighter leading-[0.9]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">RAMADAN</span>
            <span className="block text-gold-gradient drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]">LEAGUE</span>
          </h1>
        </div>

        {/* Central Bracket Visualization */}
        <div className={`w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-20 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

          {/* Left Column (Teams) */}
          <div className="flex flex-col gap-4 items-end">
            {/* Render Top 3 Teams */}
            {[0, 1, 2].map(i => (
              <div key={i} className="group relative w-full max-w-xs p-4 rounded-xl bg-[#0D1321]/60 border border-white/5 hover:border-[#FACC15]/50 transition-all cursor-pointer backdrop-blur-md flex items-center gap-4 justify-end">
                <div className="text-right">
                  <div className="font-bold text-white group-hover:text-[#FACC15] transition-colors">{teams[i]?.name || 'Team ' + (i + 1)}</div>
                  <div className="text-xs text-gray-500">Cohort A</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center border border-white/10 group-hover:border-[#FACC15] group-hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all">
                  {teams[i]?.logo ? <img src={teams[i]?.logo} className="w-full h-full object-cover rounded-full" /> : <span className="text-[#FACC15] font-bold">{teams[i]?.shortName?.[0]}</span>}
                </div>
                {/* Connector Line (Left) */}
                <div className="absolute right-[-32px] top-1/2 w-8 h-[1px] bg-[#FACC15]/20 hidden md:block" />
              </div>
            ))}
          </div>

          {/* Center Trophy / Vs */}
          <div className="flex flex-col items-center justify-center relative">
            <div className="w-40 h-40 md:w-56 md:h-56 relative flex items-center justify-center">
              {/* Rotating Rings */}
              <div className="absolute inset-0 rounded-full border border-[#FACC15]/20 animate-spin-slow-reverse" />
              <div className="absolute inset-4 rounded-full border border-[#FACC15]/40 border-dashed animate-spin-slow" />

              {/* Center Pulse */}
              <div className="absolute inset-0 bg-[#FACC15]/5 rounded-full blur-2xl animate-pulse" />

              {/* Trophy Icon */}
              <div className="relative z-10 p-6 rounded-full bg-gradient-to-br from-[#FACC15] to-[#CA8A04] shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                <Trophy className="w-16 h-16 md:w-20 md:h-20 text-[#040710]" />
              </div>
            </div>
          </div>

          {/* Right Column (Teams) */}
          <div className="flex flex-col gap-4 items-start">
            {/* Render Next 3 Teams */}
            {[3, 4, 5].map(i => (
              <div key={i} className="group relative w-full max-w-xs p-4 rounded-xl bg-[#0D1321]/60 border border-white/5 hover:border-[#FACC15]/50 transition-all cursor-pointer backdrop-blur-md flex items-center gap-4">
                {/* Connector Line (Right) */}
                <div className="absolute left-[-32px] top-1/2 w-8 h-[1px] bg-[#FACC15]/20 hidden md:block" />

                <div className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center border border-white/10 group-hover:border-[#FACC15] group-hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all">
                  {teams[i]?.logo ? <img src={teams[i]?.logo} className="w-full h-full object-cover rounded-full" /> : <span className="text-[#FACC15] font-bold">{teams[i]?.shortName?.[0]}</span>}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-[#FACC15] transition-colors">{teams[i]?.name || 'Team ' + (i + 1)}</div>
                  <div className="text-xs text-gray-500">Cohort B</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Iftar Time & Scroll */}
        <div className={`mt-auto flex flex-col items-center gap-6 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-[#0D1321]/80 border border-[#10B981]/30 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Moon className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm text-gray-400">Iftar Time</span>
            <span className="text-lg font-mono font-bold text-[#10B981]">{timeToIftar}</span>
          </div>

          <a href="#schedule" className="animate-bounce mt-8 text-gray-500 hover:text-[#FACC15] transition-colors">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>

      </div>

    </section>
  );
}
