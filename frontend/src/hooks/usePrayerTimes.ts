import { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes } from '@/types';

// Default prayer times as fallback
const defaultPrayerTimes: PrayerTimes = {
  fajr: '05:42',
  sunrise: '07:02',
  dhuhr: '13:15',
  asr: '16:42',
  maghrib: '19:08',
  isha: '20:28',
  date: new Date().toISOString().split('T')[0],
};

// Oujda coordinates
const OUJDA_LAT = 34.6814;
const OUJDA_LON = -1.9086;

export function usePrayerTimes() {
  const [currentPrayerTimes, setCurrentPrayerTimes] = useState<PrayerTimes>(defaultPrayerTimes);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: number } | null>(null);
  const [timeToIftar, setTimeToIftar] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch prayer times from Aladhan API for Oujda
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${OUJDA_LAT}&longitude=${OUJDA_LON}&method=3`
        );
        if (response.ok) {
          const data = await response.json();
          const timings = data.data.timings;
          setCurrentPrayerTimes({
            fajr: timings.Fajr?.substring(0, 5) || defaultPrayerTimes.fajr,
            sunrise: timings.Sunrise?.substring(0, 5) || defaultPrayerTimes.sunrise,
            dhuhr: timings.Dhuhr?.substring(0, 5) || defaultPrayerTimes.dhuhr,
            asr: timings.Asr?.substring(0, 5) || defaultPrayerTimes.asr,
            maghrib: timings.Maghrib?.substring(0, 5) || defaultPrayerTimes.maghrib,
            isha: timings.Isha?.substring(0, 5) || defaultPrayerTimes.isha,
            date: `${yyyy}-${mm}-${dd}`,
          });
        }
      } catch (error) {
        console.error('Failed to fetch prayer times from Aladhan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
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

      // Calculate time to Iftar (Maghrib)
      const maghribTime = parseTime(currentPrayerTimes.maghrib);
      const iftarDiff = maghribTime.getTime() - now.getTime();

      if (iftarDiff > 0) {
        setTimeToIftar(formatRemaining(iftarDiff));
      } else {
        setTimeToIftar('00:00:00');
      }

      // Find next prayer
      const prayers = [
        { name: 'fajr', time: currentPrayerTimes.fajr },
        { name: 'sunrise', time: currentPrayerTimes.sunrise },
        { name: 'dhuhr', time: currentPrayerTimes.dhuhr },
        { name: 'asr', time: currentPrayerTimes.asr },
        { name: 'maghrib', time: currentPrayerTimes.maghrib },
        { name: 'isha', time: currentPrayerTimes.isha },
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
  }, [currentPrayerTimes, parseTime, formatRemaining]);

  return {
    prayerTimes: currentPrayerTimes,
    nextPrayer,
    timeToIftar,
    loading,
  };
}

export function useWeather() {
  const [weather, setWeather] = useState({
    temp: 18,
    condition: 'Clear',
    wind: 12,
    humidity: 62,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Open-Meteo free API for Oujda weather
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${OUJDA_LAT}&longitude=${OUJDA_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        if (response.ok) {
          const data = await response.json();
          const current = data.current;
          // Map WMO weather codes to conditions
          const weatherCode = current.weather_code || 0;
          let condition = 'Clear';
          if (weatherCode <= 1) condition = 'Clear';
          else if (weatherCode <= 3) condition = 'Partly Cloudy';
          else if (weatherCode <= 48) condition = 'Cloudy';
          else if (weatherCode <= 67) condition = 'Rainy';
          else if (weatherCode <= 77) condition = 'Snowy';
          else if (weatherCode <= 99) condition = 'Stormy';

          setWeather({
            temp: Math.round(current.temperature_2m || 18),
            condition,
            wind: Math.round(current.wind_speed_10m || 12),
            humidity: Math.round(current.relative_humidity_2m || 62),
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather from Open-Meteo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { weather, loading };
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
