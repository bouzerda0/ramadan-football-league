import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { usePrayerTimes, useWeather } from '@/hooks/usePrayerTimes';
import { Moon, Sun, Cloud, Wind, Droplets, Navigation } from 'lucide-react';

export default function PrayerTimes() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const { prayerTimes, timeToIftar } = usePrayerTimes();
  const { weather } = useWeather();

  const prayers = [
    { key: 'fajr', icon: <Moon className="w-5 h-5" />, time: prayerTimes.fajr },
    { key: 'sunrise', icon: <Sun className="w-5 h-5" />, time: prayerTimes.sunrise },
    { key: 'dhuhr', icon: <Sun className="w-5 h-5" />, time: prayerTimes.dhuhr },
    { key: 'asr', icon: <Sun className="w-5 h-5" />, time: prayerTimes.asr },
    { key: 'maghrib', icon: <Moon className="w-5 h-5" />, time: prayerTimes.maghrib, highlight: true },
    { key: 'isha', icon: <Moon className="w-5 h-5" />, time: prayerTimes.isha },
  ];

  return (
    <section
      ref={ref}
      id="prayer-times"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1A12]/50 via-[#0B0F1C] to-[#141B2D]/50" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        {/* Moon decoration */}
        <div className="absolute top-10 right-10 opacity-10">
          <Moon className="w-64 h-64 text-[#D4A018]" fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div 
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 mb-4">
              <Moon className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm font-ui text-[#10B981]">Oujda, Morocco</span>
            </div>
            <h2 className="text-section font-display font-black text-[#F4F6FA] mb-4">
              {t('prayer.title')}
            </h2>
            <p className="text-[#A9B3C7] text-lg">{t('prayer.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Prayer Times Card */}
            <div 
              className={`lg:col-span-2 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="card-gold rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-display font-bold text-[#F4F6FA]">Today&apos;s Schedule</h3>
                  <span className="text-sm text-[#6B7280]">{prayerTimes.date}</span>
                </div>

                {/* Iftar Countdown */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#10B981]/20 to-[#D4A018]/20 border border-[#10B981]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#A9B3C7] mb-1">Time Remaining to Iftar</p>
                      <p className="text-4xl font-mono font-bold text-gold-gradient">{timeToIftar}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                      <Moon className="w-8 h-8 text-[#10B981]" />
                    </div>
                  </div>
                </div>

                {/* Prayer List */}
                <div className="space-y-3">
                  {prayers.map((prayer, index) => (
                    <div
                      key={prayer.key}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-500 ${
                        prayer.highlight 
                          ? 'bg-[#D4A018]/20 border border-[#D4A018]/30' 
                          : 'bg-[#141B2D]/50 hover:bg-[#141B2D]'
                      } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                      style={{ transitionDelay: `${300 + index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          prayer.highlight ? 'bg-[#D4A018]/30 text-[#D4A018]' : 'bg-[#141B2D] text-[#A9B3C7]'
                        }`}>
                          {prayer.icon}
                        </div>
                        <div>
                          <p className={`font-semibold ${prayer.highlight ? 'text-[#D4A018]' : 'text-[#F4F6FA]'}`}>
                            {t(`prayer.${prayer.key}`)}
                          </p>
                          {prayer.highlight && (
                            <p className="text-xs text-[#10B981]">{t('prayer.matchAfter')}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xl font-mono font-bold ${
                        prayer.highlight ? 'text-[#D4A018]' : 'text-[#F4F6FA]'
                      }`}>
                        {prayer.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather Card */}
            <div 
              className={`transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="card-gold rounded-3xl p-8 h-full">
                <h3 className="text-xl font-display font-bold text-[#F4F6FA] mb-8">
                  {t('weather.title')}
                </h3>

                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-[#D4A018]/20 flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-12 h-12 text-[#D4A018]" />
                  </div>
                  <p className="text-5xl font-display font-bold text-[#F4F6FA]">
                    {weather.temp}°C
                  </p>
                  <p className="text-lg text-[#A9B3C7] mt-2">{weather.condition}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#141B2D]/50">
                    <div className="flex items-center gap-3">
                      <Wind className="w-5 h-5 text-[#A9B3C7]" />
                      <span className="text-[#A9B3C7]">{t('weather.wind')}</span>
                    </div>
                    <span className="font-semibold text-[#F4F6FA]">{weather.wind} km/h</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#141B2D]/50">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5 text-[#A9B3C7]" />
                      <span className="text-[#A9B3C7]">{t('weather.humidity')}</span>
                    </div>
                    <span className="font-semibold text-[#F4F6FA]">{weather.humidity}%</span>
                  </div>
                </div>

                {/* Match Day Note */}
                <div className="mt-8 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30">
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#A9B3C7]">
                      Perfect conditions for tonight&apos;s matches. All games will proceed as scheduled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
