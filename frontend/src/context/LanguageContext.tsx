import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations = {
  // Navigation
  'nav.matches': { ar: 'المباريات', fr: 'Matchs', en: 'Matches' },
  'nav.standings': { ar: 'الترتيب', fr: 'Classement', en: 'Standings' },
  'nav.stats': { ar: 'الإحصائيات', fr: 'Statistiques', en: 'Stats' },
  'nav.schedule': { ar: 'الجدول', fr: 'Calendrier', en: 'Schedule' },
  'nav.prayerTimes': { ar: 'أوقات الصلاة', fr: 'Horaires Prière', en: 'Prayer Times' },
  'nav.register': { ar: 'تسجيل الفريق', fr: 'Inscrire Équipe', en: 'Register Team' },

  // Hero
  'hero.ramadan': { ar: 'رمضان', fr: 'RAMADAN', en: 'RAMADAN' },
  'hero.football': { ar: 'كرة القدم', fr: 'FOOTBALL', en: 'FOOTBALL' },
  'hero.league': { ar: 'الدوري', fr: 'LEAGUE', en: 'LEAGUE' },
  'hero.subtitle': { ar: 'زون 01 وجدة • بطولة المدرسة 2026', fr: 'UMPO • Tournoi Scolaire 2026', en: 'UMPO • School Tournament 2026' },
  'hero.cta': { ar: 'عرض الجدول', fr: 'Voir Calendrier', en: 'View Schedule' },
'hero.meta': { ar: '6 فرق • دور المجموعات → خروج المغلوب • مباريات ما بعد الإفطار', fr: '6 équipes • Groupes → Élimination • Matchs post-Iftar', en: '6 teams • Group stage → Knockout • Post-Iftar matches' },
'hero.nextMatch': { ar: 'المباراة القادمة', fr: 'Prochain Match', en: 'Next Match' },
'hero.vs': { ar: 'ضد', fr: 'VS', en: 'VS' },

// Match of the Day
'mod.title': { ar: 'مباراة اليوم', fr: 'MATCH DU JOUR', en: 'MATCH OF THE DAY' },
'mod.details': { ar: 'تفاصيل المباراة', fr: 'Détails Match', en: 'Match Details' },
'mod.venue': { ar: 'الملعب', fr: 'Stade', en: 'Venue' },

// Standings
'standings.title': { ar: 'الترتيب', fr: 'CLASSEMENT', en: 'STANDINGS' },
'standings.subtitle': { ar: '', fr: '', en: '' },
'standings.team': { ar: 'الفريق', fr: 'Équipe', en: 'Team' },
'standings.mp': { ar: 'ل', fr: 'MJ', en: 'MP' },
'standings.w': { ar: 'ف', fr: 'V', en: 'W' },
'standings.d': { ar: 'ت', fr: 'N', en: 'D' },
'standings.l': { ar: 'خ', fr: 'D', en: 'L' },
'standings.gf': { ar: 'له', fr: 'BP', en: 'GF' },
'standings.ga': { ar: 'عليه', fr: 'BC', en: 'GA' },
'standings.gd': { ar: 'ف.ع', fr: 'Diff', en: 'GD' },
'standings.pts': { ar: 'ن', fr: 'Pts', en: 'PTS' },
'standings.form': { ar: 'الن form', fr: 'Forme', en: 'Form' },

// Stats
'stats.title': { ar: 'الهدافون', fr: 'BUTEURS', en: 'TOP SCORERS' },
'stats.goals': { ar: 'أهداف', fr: 'BUTS', en: 'GOALS' },
'stats.assists': { ar: 'التمريرات الحاسمة', fr: 'PASSES DÉCISIVES', en: 'ASSISTS' },
'stats.cleanSheets': { ar: 'الشباك النظيفة', fr: 'CLEAN SHEETS', en: 'CLEAN SHEETS' },
'stats.cards': { ar: 'البطاقات', fr: 'CARTONS', en: 'CARDS' },
'stats.matches': { ar: 'مباريات', fr: 'matchs', en: 'matches' },
'stats.shots': { ar: 'تسديدات', fr: 'tirs', en: 'shots' },
'stats.conversion': { ar: 'نسبة التحويل', fr: 'conversion', en: 'conversion' },

// Schedule
'schedule.title': { ar: 'الجدول', fr: 'CALENDRIER', en: 'SCHEDULE' },
'schedule.subtitle': { ar: 'مباريات دور المجموعات • جميع الأوقات بعد الإفطار', fr: 'Fixtures groupe • Tous les horaires post-Iftar', en: 'Group stage fixtures • All times post-Iftar' },
'schedule.matchday': { ar: 'الجولة', fr: 'Journée', en: 'Matchday' },
'schedule.finished': { ar: 'انتهت', fr: 'Terminé', en: 'Finished' },
'schedule.live': { ar: 'مباشر', fr: 'En Direct', en: 'LIVE' },
'schedule.scheduled': { ar: 'مجدولة', fr: 'Programmé', en: 'Scheduled' },

// Ramadan Spirit
'spirit.title': { ar: 'روح رمضان', fr: 'ESPRIT RAMADAN', en: 'RAMADAN SPIRIT' },
'spirit.subtitle': { ar: 'لعب نظيف • احترام • عمل جماعي', fr: 'Fair-play • Respect • Esprit d\'équipe', en: 'Fair play • Respect • Teamwork' },
'spirit.score': { ar: 'الن score', fr: 'Score', en: 'Score' },

  // Gallery
  'gallery.title': { ar: 'اللحظات', fr: 'MOMENTS', en: 'MOMENTS' },
  'gallery.subtitle': { ar: 'أبرز ما بعد المباراة من زون 01 وجدة', fr: 'Moments post-match de UMPO', en: 'Post-match highlights from UMPO' },

// Prayer Times
'prayer.title': { ar: 'أوقات الصلاة', fr: 'HORAIRES PRIÈRE', en: 'PRAYER TIMES' },
'prayer.subtitle': { ar: 'وجدة • رمضان 2026', fr: 'Oujda • Ramadan 2026', en: 'Oujda • Ramadan 2026' },
'prayer.fajr': { ar: 'الفجر', fr: 'Fajr', en: 'Fajr' },
'prayer.sunrise': { ar: 'الشروق', fr: 'Lever', en: 'Sunrise' },
'prayer.dhuhr': { ar: 'الظهر', fr: 'Dhuhr', en: 'Dhuhr' },
'prayer.asr': { ar: 'العصر', fr: 'Asr', en: 'Asr' },
'prayer.maghrib': { ar: 'المغرب', fr: 'Maghrib', en: 'Maghrib' },
'prayer.isha': { ar: 'العشاء', fr: 'Isha', en: 'Isha' },
'prayer.matchAfter': { ar: 'المباريات تبدأ بعد المغرب', fr: 'Les matchs commencent après Maghrib', en: 'Matches start after Maghrib' },

// Weather
'weather.title': { ar: 'الطقس', fr: 'MÉTÉO', en: 'WEATHER' },
'weather.wind': { ar: 'الرياح', fr: 'Vent', en: 'Wind' },
'weather.humidity': { ar: 'الرطوبة', fr: 'Humidité', en: 'Humidity' },

// Registration
'register.title': { ar: 'سجل فريقك', fr: 'INSCRIVEZ VOTRE ÉQUIPE', en: 'REGISTER YOUR TEAM' },
'register.subtitle': { ar: '6 فرق • بطل واحد • مباريات ما بعد الإفطار', fr: '6 équipes • 1 champion • Matchs post-Iftar', en: '6 teams • 1 champion • Post-Iftar matches' },
'register.cta': { ar: 'بدء التسجيل', fr: 'Commencer Inscription', en: 'Start Registration' },
'register.download': { ar: 'تحميل القوانين (PDF)', fr: 'Télécharger Règles (PDF)', en: 'Download Rules (PDF)' },

  // Footer
  'footer.contact': { ar: 'تواصل معنا', fr: 'Contact', en: 'Contact' },
  'footer.rights': { ar: '© 2026 زون 01 وجدة. جميع الحقوق محفوظة.', fr: '© 2026 UMPO. Tous droits réservés.', en: '© 2026 UMPO. All rights reserved.' },

// Admin
'admin.title': { ar: 'لوحة التحكم', fr: 'Panneau Admin', en: 'Admin Panel' },
'admin.login': { ar: 'تسجيل الدخول', fr: 'Connexion', en: 'Login' },
'admin.username': { ar: 'اسم المستخدم', fr: 'Nom utilisateur', en: 'Username' },
'admin.password': { ar: 'كلمة المرور', fr: 'Mot de passe', en: 'Password' },

// Common
'common.vs': { ar: 'ضد', fr: 'vs', en: 'vs' },
'common.viewAll': { ar: 'عرض الكل', fr: 'Voir Tout', en: 'View All' },
'common.close': { ar: 'إغلاق', fr: 'Fermer', en: 'Close' },
'common.save': { ar: 'حفظ', fr: 'Sauvegarder', en: 'Save' },
'common.cancel': { ar: 'إلغاء', fr: 'Annuler', en: 'Cancel' },
'common.loading': { ar: 'جاري التحميل...', fr: 'Chargement...', en: 'Loading...' },
'common.error': { ar: 'خطأ', fr: 'Erreur', en: 'Error' },
'common.success': { ar: 'نجاح', fr: 'Succès', en: 'Success' },

// Status
'status.loading': { ar: 'جاري التحميل...', fr: 'Chargement...', en: 'Loading...' },
'status.no_data': { ar: 'لا توجد بيانات', fr: 'Aucune donnée', en: 'No data available' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) return key;
    return translation[language];
  }, [language]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
