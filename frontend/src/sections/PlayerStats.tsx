import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Trophy, Target, HandHelping, Shield, AlertTriangle } from 'lucide-react';
import type { BackendPlayer, BackendTeam } from '@/types';

type StatTab = 'goals' | 'assists' | 'cleanSheets' | 'cards';

export default function PlayerStats() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<StatTab>('goals');
  const [players, setPlayers] = useState<BackendPlayer[]>([]);
  const [teams, setTeams] = useState<Record<string, BackendTeam>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/teams`)
      .then(res => res.json())
      .then((json) => {
        const data: BackendTeam[] = Array.isArray(json) ? json : (json.data || []);
        const allPlayers: BackendPlayer[] = [];
        const teamsMap: Record<string, BackendTeam> = {};

        data.forEach((team) => {
          teamsMap[team.id] = team;
          if (team.players) {
            team.players.forEach((p) => {
              allPlayers.push({ ...p, teamId: team.id });
            });
          }
        });

        setPlayers(allPlayers);
        setTeams(teamsMap);
      })
      .catch(err => console.error(err));
  }, []);

  const getTopPlayers = () => {
    const sorted = [...players];
    switch (activeTab) {
      case 'goals':
        return sorted.sort((a, b) => (b.goals || 0) - (a.goals || 0));
      case 'assists':
        return sorted.sort((a, b) => (b.assists || 0) - (a.assists || 0));
      case 'cleanSheets':
        return sorted.sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0));
      case 'cards':
        return sorted.sort((a, b) => {
          const pointsA = (a.redCards || 0) * 3 + (a.yellowCards || 0);
          const pointsB = (b.redCards || 0) * 3 + (b.yellowCards || 0);
          return pointsB - pointsA;
        });
      default: return sorted;
    }
  };

  const topPlayers = getTopPlayers().slice(0, 6);

  const tabs: { id: StatTab; label: string; icon: React.ReactNode }[] = [
    { id: 'goals', label: t('stats.goals'), icon: <Target className="w-4 h-4" /> },
    { id: 'assists', label: t('stats.assists'), icon: <HandHelping className="w-4 h-4" /> },
    { id: 'cleanSheets', label: t('stats.cleanSheets'), icon: <Shield className="w-4 h-4" /> },
    { id: 'cards', label: t('stats.cards'), icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const getStatValue = (player: BackendPlayer) => {
    switch (activeTab) {
      case 'goals': return player.goals || 0;
      case 'assists': return player.assists || 0;
      case 'cleanSheets': return player.cleanSheets || 0;
      case 'cards': return (player.redCards || 0) * 3 + (player.yellowCards || 0);
      default: return 0;
    }
  };

  const getStatLabel = () => {
    switch (activeTab) {
      case 'goals': return t('stats.goals');
      case 'assists': return t('stats.assists');
      case 'cleanSheets': return t('stats.cleanSheets');
      case 'cards': return t('stats.cards');
    }
  };




  return (
    <section
      ref={ref}
      id="stats"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1C] via-[#141B2D]/50 to-[#0B0F1C]" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-[#D4A018]" />
              <h2 className="text-section font-display font-black text-[#F4F6FA]">
                {t('stats.title')}
              </h2>
            </div>
          </div>

          {/* Tabs */}
          <div
            className={`flex flex-wrap gap-2 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui font-medium transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-[#D4A018] text-[#0B0F1C] shadow-lg shadow-[#D4A018]/20'
                  : 'bg-[#141B2D] text-[#A9B3C7] hover:bg-[#1A2340] hover:text-[#F4F6FA]'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Featured Player (Top 1) */}
          {topPlayers[0] && (
            <div
              className={`mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <div className="card-gold rounded-3xl p-8 md:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A018]/5 rounded-full blur-3xl" />
                <div className="grid md:grid-cols-3 gap-8 items-center relative">
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A018]/20 text-[#D4A018] text-sm font-ui font-semibold mb-4 border border-[#D4A018]/20">
                      <Trophy className="w-4 h-4" />
                      #1 {getStatLabel()}
                    </div>
                    <div className="text-7xl md:text-8xl font-display font-black text-gold-gradient leading-none">
                      {getStatValue(topPlayers[0]).toString().padStart(2, '0')}
                    </div>
                    <p className="text-lg text-[#A9B3C7] uppercase tracking-wider mt-2">
                      {getStatLabel()}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold overflow-hidden bg-gradient-to-br from-[#D4A018] to-[#B38612]">
                      <span className="text-white drop-shadow-lg">{topPlayers[0].name.split(' ').map((n: string) => n[0]).join('')}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-[#F4F6FA]">
                      {topPlayers[0].name}
                    </h3>
                    <p className="text-[#A9B3C7] mt-1">{teams[topPlayers[0].teamId]?.teamName}</p>
                    <p className="text-xs text-[#6B7280] mt-1">#{topPlayers[0].number} • {topPlayers[0].position}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-[#0B0F1C]/50 backdrop-blur text-center">
                      <p className="text-2xl font-bold text-[#F4F6FA]">{topPlayers[0].goals || 0}</p>
                      <p className="text-xs text-[#A9B3C7] mt-0.5">{t('stats.goals')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B0F1C]/50 backdrop-blur text-center">
                      <p className="text-2xl font-bold text-[#F4F6FA]">{topPlayers[0].assists || 0}</p>
                      <p className="text-xs text-[#A9B3C7] mt-0.5">{t('stats.assists')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B0F1C]/50 backdrop-blur text-center">
                      <p className="text-2xl font-bold text-[#F4F6FA]">{topPlayers[0].matchesPlayed || 0}</p>
                      <p className="text-xs text-[#A9B3C7] mt-0.5">{t('stats.matches')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B0F1C]/50 backdrop-blur text-center">
                      <p className="text-2xl font-bold text-[#F4F6FA]">{topPlayers[0].cleanSheets || 0}</p>
                      <p className="text-xs text-[#A9B3C7] mt-0.5">{t('stats.cleanSheets')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Rankings */}
          <div
            className={`space-y-2 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {topPlayers.slice(1).map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#141B2D]/60 hover:bg-[#1A2340] border border-transparent hover:border-[#D4A018]/10 transition-all duration-300 group"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <span className={`w-8 text-center text-lg font-bold flex-shrink-0 ${index === 0 ? 'text-[#C0C0C0]' : index === 1 ? 'text-[#CD7F32]' : 'text-[#6B7280]'
                  }`}>
                  {index + 2}
                </span>

                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform duration-300 group-hover:scale-110 bg-[#333]">
                  <span className="text-white">{player.name.split(' ').map((n: string) => n[0]).join('')}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F4F6FA] truncate">{player.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {teams[player.teamId]?.teamName}
                    {player.number ? ` • #${player.number}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {activeTab === 'cards' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-yellow-400/15 text-yellow-400 text-sm font-bold border border-yellow-400/20">
                        {player.yellowCards || 0}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-red-400/15 text-red-400 text-sm font-bold border border-red-400/20">
                        {player.redCards || 0}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-display font-bold text-[#D4A018] group-hover:scale-110 transition-transform duration-300">
                      {getStatValue(player)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
