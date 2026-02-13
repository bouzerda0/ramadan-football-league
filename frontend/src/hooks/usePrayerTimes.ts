import { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes } from '@/types';

// Prayer times for Oujda, Morocco during Ramadan 2026 (approximate)
const ramadan2026PrayerTimes: Record<string, PrayerTimes> = {
  '2026-03-28': { fajr: '05:42', sunrise: '07:02', dhuhr: '13:15', asr: '16:42', maghrib: '19:08', isha: '20:28', date: '2026-03-28' },
  '2026-03-29': { fajr: '05:40', sunrise: '07:00', dhuhr: '13:15', asr: '16:43', maghrib: '19:09', isha: '20:29', date: '2026-03-29' },
  '2026-03-30': { fajr: '05:38', sunrise: '06:58', dhuhr: '13:15', asr: '16:43', maghrib: '19:10', isha: '20:30', date: '2026-03-30' },
  '2026-03-31': { fajr: '05:36', sunrise: '06:56', dhuhr: '13:14', asr: '16:44', maghrib: '19:11', isha: '20:31', date: '2026-03-31' },
  '2026-04-01': { fajr: '05:34', sunrise: '06:54', dhuhr: '13:14', asr: '16:44', maghrib: '19:12', isha: '20:32', date: '2026-04-01' },
  '2026-04-02': { fajr: '05:32', sunrise: '06:52', dhuhr: '13:14', asr: '16:45', maghrib: '19:13', isha: '20:33', date: '2026-04-02' },
  '2026-04-03': { fajr: '05:30', sunrise: '06:50', dhuhr: '13:13', asr: '16:45', maghrib: '19:14', isha: '20:34', date: '2026-04-03' },
  '2026-04-04': { fajr: '05:28', sunrise: '06:48', dhuhr: '13:13', asr: '16:46', maghrib: '19:15', isha: '20:35', date: '2026-04-04' },
  '2026-04-05': { fajr: '05:26', sunrise: '06:46', dhuhr: '13:13', asr: '16:46', maghrib: '19:16', isha: '20:36', date: '2026-04-05' },
};

export function usePrayerTimes() {
  const [currentPrayerTimes, setCurrentPrayerTimes] = useState<PrayerTimes>(ramadan2026PrayerTimes['2026-03-28']);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: number } | null>(null);
  const [timeToIftar, setTimeToIftar] = useState<string>('');

  const getPrayerTimesForDate = useCallback((date: Date): PrayerTimes => {
    const dateStr = date.toISOString().split('T')[0];
    return ramadan2026PrayerTimes[dateStr] || ramadan2026PrayerTimes['2026-03-28'];
  }, []);

  const parseTime = useCallback((timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, []);

  const formatRemaining = useCallback((ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const times = getPrayerTimesForDate(now);
      setCurrentPrayerTimes(times);

      // Calculate time to Iftar (Maghrib)
      const maghribTime = parseTime(times.maghrib);
      const iftarDiff = maghribTime.getTime() - now.getTime();
      
      if (iftarDiff > 0) {
        setTimeToIftar(formatRemaining(iftarDiff));
      } else {
        setTimeToIftar('00:00:00');
      }

      // Find next prayer
      const prayers = [
        { name: 'fajr', time: times.fajr },
        { name: 'sunrise', time: times.sunrise },
        { name: 'dhuhr', time: times.dhuhr },
        { name: 'asr', time: times.asr },
        { name: 'maghrib', time: times.maghrib },
        { name: 'isha', time: times.isha },
      ];

      for (const prayer of prayers) {
        const prayerTime = parseTime(prayer.time);
        const diff = prayerTime.getTime() - now.getTime();
        if (diff > 0) {
          setNextPrayer({ name: prayer.name, time: prayer.time, remaining: diff });
          break;
        }
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [getPrayerTimesForDate, parseTime, formatRemaining]);

  return {
    prayerTimes: currentPrayerTimes,
    nextPrayer,
    timeToIftar,
    getPrayerTimesForDate,
  };
}

export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return { timeLeft, isExpired };
}
