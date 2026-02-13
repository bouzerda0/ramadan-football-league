import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getTopScorers, getTopAssists, getCleanSheets, getDisciplinary, getTeamById } from '@/data/leagueData';
import { Trophy, Target, HandHelping, Shield, AlertTriangle } from 'lucide-react';

type StatTab = 'goals' | 'assists' | 'cleanSheets' | 'cards';

export default function PlayerStats() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<StatTab>('goals');

  const topScorers = getTopScorers();
  const topAssists = getTopAssists();
  const cleanSheets = getCleanSheets();
  const disciplinary = getDisciplinary();

  const tabs: { id: StatTab; label: string; icon: React.ReactNode }[] = [
    { id: 'goals', label: t('stats.goals'), icon: <Target className="w-4 h-4" /> },
    { id: 'assists', label: t('stats.assists'), icon: <HandHelping className="w-4 h-4" /> },
    { id: 'cleanSheets', label: t('stats.cleanSheets'), icon: <Shield className="w-4 h-4" /> },
    { id: 'cards', label: t('stats.cards'), icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'goals': return topScorers;
      case 'assists': return topAssists;
      case 'cleanSheets': return cleanSheets;
      case 'cards': return disciplinary;
      default: return topScorers;
    }
  };

  const getStatValue = (player: typeof topScorers[0]) => {
    switch (activeTab) {
      case 'goals': return player.stats.goals;
      case 'assists': return player.stats.assists;
      case 'cleanSheets': return player.stats.cleanSheets;
      case 'cards': return player.stats.redCards * 3 + player.stats.yellowCards;
      default: return player.stats.goals;
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
            className={`mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
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
            className={`flex flex-wrap gap-2 mb-8 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-ui font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#D4A018] text-[#0B0F1C]'
                    : 'bg-[#141B2D] text-[#A9B3C7] hover:bg-[#141B2D]/80'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Featured Player (Top 1) */}
          {getCurrentData()[0] && (
            <div 
              className={`mb-8 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="card-gold rounded-3xl p-8 md:p-12 overflow-hidden">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  {/* Stats */}
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A018]/20 text-[#D4A018] text-sm font-ui mb-4">
                      <Trophy className="w-4 h-4" />
                      #1 Rank
                    </div>
                    <div className="text-7xl md:text-8xl font-display font-black text-gold-gradient">
                      {getStatValue(getCurrentData()[0]).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xl text-[#A9B3C7] uppercase tracking-wider mt-2">
                      {activeTab === 'goals' ? t('stats.goals') : 
                       activeTab === 'assists' ? t('stats.assists') :
                       activeTab === 'cleanSheets' ? t('stats.cleanSheets') : t('stats.cards')}
                    </p>
                  </div>

                  {/* Player Info */}
                  <div className="text-center">
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
                      style={{ 
                        backgroundColor: getTeamById(getCurrentData()[0].teamId)?.colors.primary,
                        color: getTeamById(getCurrentData()[0].teamId)?.colors.secondary
                      }}
                    >
                      {getCurrentData()[0].name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-[#F4F6FA]">
                      {getCurrentData()[0].name}
                    </h3>
                    <p className="text-[#A9B3C7]">
                      {getTeamById(getCurrentData()[0].teamId)?.name}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[#A9B3C7]">
                      <span>{getCurrentData()[0].stats.matchesPlayed} {t('stats.matches')}</span>
                      {activeTab === 'goals' && (
                        <>
                          <span>•</span>
                          <span>{Math.round((getCurrentData()[0].stats.goals / getCurrentData()[0].stats.matchesPlayed) * 10) / 10} G/M</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {activeTab === 'goals' && (
                      <>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-[#F4F6FA]">{getCurrentData()[0].stats.assists}</p>
                          <p className="text-xs text-[#A9B3C7]">{t('stats.assists')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-[#F4F6FA]">
                            {Math.round((getCurrentData()[0].stats.goals / (getCurrentData()[0].stats.matchesPlayed * 3)) * 100)}%
                          </p>
                          <p className="text-xs text-[#A9B3C7]">{t('stats.conversion')}</p>
                        </div>
                      </>
                    )}
                    {activeTab === 'assists' && (
                      <>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-[#F4F6FA]">{getCurrentData()[0].stats.goals}</p>
                          <p className="text-xs text-[#A9B3C7]">{t('stats.goals')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-[#F4F6FA]">
                            {getCurrentData()[0].stats.goals + getCurrentData()[0].stats.assists}
                          </p>
                          <p className="text-xs text-[#A9B3C7]">G+A</p>
                        </div>
                      </>
                    )}
                    {activeTab === 'cleanSheets' && (
                      <>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-[#F4F6FA]">{getCurrentData()[0].stats.matchesPlayed}</p>
                          <p className="text-xs text-[#A9B3C7]">{t('stats.matches')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-[#F4F6FA]">
                            {Math.round((getCurrentData()[0].stats.cleanSheets / getCurrentData()[0].stats.matchesPlayed) * 100)}%
                          </p>
                          <p className="text-xs text-[#A9B3C7]">CS Rate</p>
                        </div>
                      </>
                    )}
                    {activeTab === 'cards' && (
                      <>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-yellow-400">{getCurrentData()[0].stats.yellowCards}</p>
                          <p className="text-xs text-[#A9B3C7]">Yellow</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#141B2D]">
                          <p className="text-2xl font-bold text-red-400">{getCurrentData()[0].stats.redCards}</p>
                          <p className="text-xs text-[#A9B3C7]">Red</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Rankings */}
          <div 
            className={`grid gap-4 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {getCurrentData().slice(1, 6).map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#141B2D]/50 hover:bg-[#141B2D] transition-all duration-300"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <span className="w-8 text-center text-lg font-bold text-[#6B7280]">
                  {index + 2}
                </span>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ 
                    backgroundColor: getTeamById(player.teamId)?.colors.primary,
                    color: getTeamById(player.teamId)?.colors.secondary
                  }}
                >
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F4F6FA] truncate">{player.name}</p>
                  <p className="text-xs text-[#6B7280]">{getTeamById(player.teamId)?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  {activeTab === 'cards' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-yellow-400/20 text-yellow-400 text-sm font-bold">
                        {player.stats.yellowCards}
                      </span>
                      <span className="px-2 py-1 rounded bg-red-400/20 text-red-400 text-sm font-bold">
                        {player.stats.redCards}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-display font-bold text-[#D4A018]">
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
