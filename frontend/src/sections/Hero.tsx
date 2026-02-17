import { useEffect, useState, useRef } from 'react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { ChevronDown, Moon, Star, Trophy } from 'lucide-react';
import type { Team } from '@/types';

export default function Hero() {
  const { dir } = useLanguage();
  const { timeToIftar } = usePrayerTimes();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_URL}/api/teams`);
        if (res.ok) {
          const json = await res.json();
          const data = Array.isArray(json) ? json : (json.data || []);

          const mappedTeams = data.map((t: any) => ({
            id: t.id,
            name: t.name || t.teamName || 'Unknown Team',
            shortName: (t.name || t.teamName || 'UNK').substring(0, 3).toUpperCase(),
            logo: t.logoPath || '',
            colors: { primary: t.primaryColor || '#D4AF37', secondary: t.secondaryColor || '#020408' }
          }));
          setTeams(mappedTeams.slice(0, 8));
        }
      } catch (e) {
        console.error("Hero fetch error", e);
      }
      setIsLoaded(true);
    };
    fetchTeams();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-[var(--rl-navy)] flex flex-col justify-center" dir={dir}>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--rl-navy-light)] via-[var(--rl-navy)] to-[#000000]" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      {/* Circuit Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(var(--rl-gold) 1px, transparent 1px), linear-gradient(90deg, var(--rl-gold) 1px, transparent 1px)`, backgroundSize: '50px 50px' }}>
      </div>

      {/* Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--rl-gold)]/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--rl-emerald)]/10 rounded-full blur-[128px] animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center">

        {/* League Badge / Title */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[var(--rl-gold)]/10 border border-[var(--rl-gold)]/20 backdrop-blur-md mb-6 shadow-[0_0_20px_-5px_var(--rl-gold)]/30">
            <Star className="w-4 h-4 text-[var(--rl-gold)] fill-current animate-spin-slow" />
            <span className="text-sm font-bold text-[var(--rl-gold)] tracking-widest uppercase">Ramadan Football League 2026</span>
          </div>
          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-white tracking-tighter leading-[0.9]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--rl-gray)]">RAMADAN</span>
            <span className="block text-gold-gradient drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">LEAGUE</span>
          </h1>
        </div>

        {/* Central Bracket Visualization */}
        <div className={`w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-20 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

          {/* Left Column (Teams) */}
          <div className="flex flex-col gap-6 items-end">
            {[0, 1, 2].map(i => (
              <div key={i} className="group relative w-full max-w-xs p-4 rounded-xl glass hover:border-[var(--rl-gold)]/50 transition-all cursor-pointer flex items-center gap-4 justify-end transform hover:-translate-x-2">
                <div className="text-right">
                  <div className="font-bold text-white group-hover:text-[var(--rl-gold)] transition-colors font-display tracking-wide">{teams[i]?.name || 'Waiting...'}</div>
                  <div className="text-xs text-[var(--rl-gray)] uppercase tracking-wider">Cohort A</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--rl-navy-light)] flex items-center justify-center border border-white/10 group-hover:border-[var(--rl-gold)] group-hover:shadow-[0_0_15px_var(--rl-gold)]/40 transition-all relative overflow-hidden">
                  {/* Team Logo or Initial */}
                  {teams[i]?.logo ?
                    <img src={teams[i]?.logo} className="w-full h-full object-cover" alt={teams[i]?.name} /> :
                    <span className="text-[var(--rl-gold)] font-bold text-lg">{teams[i]?.shortName?.[0] || '?'}</span>
                  }
                </div>
                {/* Circuit Line (Left) */}
                <div className="absolute right-[-40px] top-1/2 w-10 h-[2px] bg-[var(--rl-gold)]/20 hidden md:block">
                  <div className="absolute right-0 top-[-3px] w-2 h-2 rounded-full bg-[var(--rl-gold)] shadow-[0_0_10px_var(--rl-gold)]" />
                </div>
              </div>
            ))}
          </div>

          {/* Center Trophy Node */}
          <div className="flex flex-col items-center justify-center relative">
            <div className="w-48 h-48 md:w-64 md:h-64 relative flex items-center justify-center">
              {/* Rotating Rings */}
              <div className="absolute inset-0 rounded-full border border-[var(--rl-gold)]/20 animate-spin-slow-reverse" />
              <div className="absolute inset-4 rounded-full border border-[var(--rl-gold)]/40 border-dashed animate-spin-slow" />
              <div className="absolute inset-0 bg-[var(--rl-gold)]/5 rounded-full blur-3xl animate-pulse" />

              {/* Central Hexagon/Trophy Container */}
              <div className="relative z-10 p-8 rounded-2xl bg-gradient-to-br from-[var(--rl-gold)] to-[var(--rl-gold-dark)] shadow-[0_0_60px_rgba(212,175,55,0.6)] rotate-45 transform hover:scale-110 transition-transform duration-500">
                <div className="-rotate-45">
                  <Trophy className="w-20 h-20 md:w-24 md:h-24 text-[var(--rl-navy)] drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Connecting Verticals */}
            <div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--rl-gold)]/30 to-transparent -z-10" />
          </div>

          {/* Right Column (Teams) */}
          <div className="flex flex-col gap-6 items-start">
            {[3, 4, 5].map(i => (
              <div key={i} className="group relative w-full max-w-xs p-4 rounded-xl glass hover:border-[var(--rl-gold)]/50 transition-all cursor-pointer flex items-center gap-4 transform hover:translate-x-2">
                {/* Circuit Line (Right) */}
                <div className="absolute left-[-40px] top-1/2 w-10 h-[2px] bg-[var(--rl-gold)]/20 hidden md:block">
                  <div className="absolute left-0 top-[-3px] w-2 h-2 rounded-full bg-[var(--rl-gold)] shadow-[0_0_10px_var(--rl-gold)]" />
                </div>

                <div className="w-12 h-12 rounded-xl bg-[var(--rl-navy-light)] flex items-center justify-center border border-white/10 group-hover:border-[var(--rl-gold)] group-hover:shadow-[0_0_15px_var(--rl-gold)]/40 transition-all relative overflow-hidden">
                  {teams[i]?.logo ?
                    <img src={teams[i]?.logo} className="w-full h-full object-cover" alt={teams[i]?.name} /> :
                    <span className="text-[var(--rl-gold)] font-bold text-lg">{teams[i]?.shortName?.[0] || '?'}</span>
                  }
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-[var(--rl-gold)] transition-colors font-display tracking-wide">{teams[i]?.name || 'Waiting...'}</div>
                  <div className="text-xs text-[var(--rl-gray)] uppercase tracking-wider">Cohort B</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className={`mt-auto flex flex-col items-center gap-6 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-[var(--rl-navy-light)] border border-[var(--rl-emerald)]/30 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)] group hover:border-[var(--rl-emerald)] transition-all">
            <Moon className="w-5 h-5 text-[var(--rl-emerald)] group-hover:animate-pulse" />
            <span className="text-sm text-[var(--rl-gray)]">Iftar Time</span>
            <span className="text-lg font-mono font-bold text-[var(--rl-emerald)]">{timeToIftar}</span>
          </div>

          <a href="#match-of-day" className="animate-bounce mt-8 text-[var(--rl-gray)] hover:text-[var(--rl-gold)] transition-colors">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>

      </div>

    </section>
  );
}
