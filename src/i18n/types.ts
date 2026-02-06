export type Language = 'en' | 'bn' | 'ar';

export interface TranslationKeys {
  // Common
  common: {
    appName: string;
    loading: string;
    error: string;
    today: string;
    or: string;
    clear: string;
    tryAgain: string;
    unknownLocation: string;
    // Tab labels
    tabs: {
      prayer: string;
      fasting: string;
      qibla: string;
      schedule: string;
      duas: string;
      hijriCalendar: string;
    };
  };

  // Prayer
  prayer: {
    title: string;
    nextPrayer: string;
    timeRemaining: string;
    comingUp: string;
    at: string;
    names: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    additional: {
      title: string;
      imsak: string;
      imsakDesc: string;
      midnight: string;
      midnightDesc: string;
      lastThird: string;
      lastThirdDesc: string;
    };
    makruh: {
      title: string;
      description: string;
      sunrise: string;
      solarNoon: string;
      sunset: string;
    };
  };

  // Fasting
  fasting: {
    title: string;
    ramadanMubarak: string;
    daysUntilRamadan: string;
    duration: string;
    sahurEndsIn: string;
    iftarIn: string;
    sahur: string;
    sahurSehri: string;
    iftar: string;
    endOfPreDawnMeal: string;
    timeToBreakFast: string;
    currentlyFasting: string;
    mayAllahAccept: string;
    prepareForSahur: string;
    dontForgetIntention: string;
    fastCompleted: string;
    alhamdulillah: string;
    whiteDays: {
      title: string;
      description: string;
      todayIsWhiteDay: string;
      todayLabel: string;
      dayOfMonth: string;
      hadith: string;
    };
  };

  // Qibla
  qibla: {
    title: string;
    subtitle: string;
    direction: string;
    distance: string;
    toMakkah: string;
    compassNotSupported: string;
    compassPermissionDenied: string;
    holdDeviceFlat: string;
    faceDirection: string;
    yourHeading: string;
    youLabel: string;
    qiblaLabel: string;
    cardinalDirections: {
      N: string;
      NE: string;
      E: string;
      SE: string;
      S: string;
      SW: string;
      W: string;
      NW: string;
    };
  };

  // Schedule
  schedule: {
    title: string;
    prayerTimes: string;
    fastingTimes: string;
    date: string;
    sahurEnds: string;
    noLocationPrayer: string;
    noLocationFasting: string;
  };

  // Duas
  dua: {
    title: string;
    subtitle: string;
    duaOfTheDay: string;
    searchPlaceholder: string;
    all: string;
    allCategories: string;
    duaCount: string;
    duasCount: string;
    inCategory: string;
    noDuasFound: string;
    tryDifferent: string;
    transliteration: string;
    backgroundHistory: string;
    categories: {
      prayer: string;
      'morning-evening': string;
      'food-drink': string;
      travel: string;
      sleep: string;
      protection: string;
      forgiveness: string;
      'daily-life': string;
      prophets: string;
      rabbana: string;
      purification: string;
      'hajj-umrah': string;
      nature: string;
      family: string;
      'ramadan-fasting': string;
      'illness-death': string;
    };
  };

  // Settings
  settings: {
    title: string;
    description: string;
    location: string;
    gettingLocation: string;
    setLocation: string;
    calculationMethod: string;
    calculationMethodDesc: string;
    selectMethod: string;
    juristicSchool: string;
    juristicSchoolDesc: string;
    selectSchool: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    timeFormat24: string;
    timeFormat24Desc: string;
    showSeconds: string;
    showSecondsDesc: string;
    notifications: string;
    prayerNotifications: string;
    prayerNotificationsDesc: string;
    adhanSound: string;
    adhanSoundDesc: string;
    selectAdhan: string;
    language: string;
    resetDefaults: string;
    infoText: string;
  };

  // Location prompt
  location: {
    greeting: string;
    welcome: string;
    setYourLocation: string;
    locationNeeded: string;
    gettingLocation: string;
    useCurrentLocation: string;
    privacyNote: string;
    featurePrayer: string;
    featureQibla: string;
    featureFasting: string;
  };

  // Footer
  footer: {
    about: string;
    poweredBy: string;
    adhanLibrary: string;
    adhanLibraryDesc: string;
    hijriConverter: string;
    hijriConverterDesc: string;
    features: string;
    featureAccurate: string;
    featureMethods: string;
    featureQibla: string;
    featureFasting: string;
    featureOffline: string;
    developer: string;
    developerDesc: string;
    portfolio: string;
    madeWith: string;
    forUmmah: string;
    attribution: string;
    hijriDatesBy: string;
  };

  // Hijri Calendar
  hijriCalendar: {
    title: string;
    subtitle: string;
    today: string;
    whiteDay: string;
    ramadan: string;
    jumpToToday: string;
    eidUlFitr: string;
    eidUlAdha: string;
    dayOfArafah: string;
    tashriq: string;
    laylatulQadr: string;
    weekdays: {
      sat: string;
      sun: string;
      mon: string;
      tue: string;
      wed: string;
      thu: string;
      fri: string;
    };
  };

  // Islamic Occasions
  occasions: {
    dismiss: string;
    duaLabel: string;
    ritualsLabel: string;
    ramadan: {
      greeting: string;
      subtitle: string;
      duaArabic: string;
      duaTranslation: string;
      duaReference: string;
      rituals: string[];
    };
    laylatulQadr: {
      greeting: string;
      subtitle: string;
      duaArabic: string;
      duaTranslation: string;
      duaReference: string;
      rituals: string[];
    };
    eidUlFitr: {
      greeting: string;
      subtitle: string;
      duaArabic: string;
      duaTranslation: string;
      duaReference: string;
      rituals: string[];
    };
    eidUlAdha: {
      greeting: string;
      subtitle: string;
      duaArabic: string;
      duaTranslation: string;
      duaReference: string;
      rituals: string[];
    };
    dayOfArafah: {
      greeting: string;
      subtitle: string;
      duaArabic: string;
      duaTranslation: string;
      duaReference: string;
      rituals: string[];
    };
    daysOfTashriq: {
      greeting: string;
      subtitle: string;
      duaArabic: string;
      duaTranslation: string;
      duaReference: string;
      rituals: string[];
    };
  };

  // Errors
  errors: {
    locationPermissionDenied: string;
    locationUnavailable: string;
    locationTimeout: string;
    locationFailed: string;
    geolocationNotSupported: string;
    nativePermissionDenied: string;
  };
}
