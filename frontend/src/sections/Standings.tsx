import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Trophy } from 'lucide-react';

export default function Standings() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        // Sort by Points, then Goal Difference
        const sorted = data.sort((a: any, b: any) => {
          if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
          return ((b.goalsFor || 0) - (b.goalsAgainst || 0)) - ((a.goalsFor || 0) - (a.goalsAgainst || 0));
        });
        setTeams(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <section
      ref={ref}
      id="standings"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1C] via-[#0D1A12]/30 to-[#0B0F1C]" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-[#D4A018]" />
              <h2 className="text-section font-display font-black text-[#F4F6FA]">
                {t('standings.title')}
              </h2>
            </div>
            <p className="text-[#A9B3C7] text-lg">{t('standings.subtitle')}</p>
          </div>

          {/* Standings Table */}
          <div
            className={`card-gold rounded-2xl overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 p-4 bg-[#141B2D] border-b border-[#D4A018]/20 text-xs font-ui font-semibold text-[#A9B3C7] uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4 md:col-span-3">{t('standings.team')}</div>
              <div className="col-span-1 text-center hidden md:block">{t('standings.mp')}</div>
              <div className="col-span-1 text-center">{t('standings.w')}</div>
              <div className="col-span-1 text-center">{t('standings.d')}</div>
              <div className="col-span-1 text-center">{t('standings.l')}</div>
              <div className="col-span-1 text-center hidden md:block">{t('standings.gf')}</div>
              <div className="col-span-1 text-center hidden md:block">{t('standings.ga')}</div>
              <div className="col-span-1 text-center">{t('standings.gd')}</div>
              <div className="col-span-2 md:col-span-1 text-center">{t('standings.pts')}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#D4A018]/10">
              {teams.map((team, index) => {
                const gd = (team.goalsFor || 0) - (team.goalsAgainst || 0);
                return (
                  <div
                    key={team.id}
                    className={`grid grid-cols-12 gap-2 p-4 items-center table-row-hover transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                      }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center">
                      {index === 0 ? (
                        <div className="w-6 h-6 rounded-full bg-[#D4A018] flex items-center justify-center mx-auto">
                          <Trophy className="w-3 h-3 text-[#0B0F1C]" />
                        </div>
                      ) : index === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-[#A9B3C7]/30 flex items-center justify-center text-sm font-bold text-[#A9B3C7] inline-flex">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-[#B38914]/30 flex items-center justify-center text-sm font-bold text-[#B38914] inline-flex">
                          3
                        </span>
                      ) : (
                        <span className="text-sm text-[#6B7280]">{index + 1}</span>
                      )}
                    </div>

                    {/* Team */}
                    <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 bg-[#333] overflow-hidden"
                      >
                        {team.logoPath ? <img src={team.logoPath} className="w-full h-full object-cover" /> : team.teamName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#F4F6FA] truncate">{team.teamName}</p>
                        <p className="text-xs text-[#6B7280] hidden sm:block">{team.captainName}</p>
                      </div>
                    </div>

                    {/* Matches Played */}
                    <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">
                      {team.played || 0}
                    </div>

                    {/* Wins */}
                    <div className="col-span-1 text-center text-emerald-400 font-semibold">
                      {team.won || 0}
                    </div>

                    {/* Draws */}
                    <div className="col-span-1 text-center text-amber-400 font-semibold">
                      {team.drawn || 0}
                    </div>

                    {/* Losses */}
                    <div className="col-span-1 text-center text-red-400 font-semibold">
                      {team.lost || 0}
                    </div>

                    {/* Goals For */}
                    <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">
                      {team.goalsFor || 0}
                    </div>

                    {/* Goals Against */}
                    <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">
                      {team.goalsAgainst || 0}
                    </div>

                    {/* Goal Difference */}
                    <div className={`col-span-1 text-center font-semibold ${gd > 0 ? 'text-emerald-400' :
                      gd < 0 ? 'text-red-400' : 'text-[#A9B3C7]'
                      }`}>
                      {gd > 0 ? `+${gd}` : gd}
                    </div>

                    {/* Points */}
                    <div className="col-span-2 md:col-span-1 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-[#D4A018]/20 text-[#D4A018] font-bold">
                        {team.points || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
