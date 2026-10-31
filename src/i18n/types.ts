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
      explore: string;
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
    map: {
      title: string;
      locateMe: string;
      locating: string;
      makkah: string;
      home: string;
      you: string;
      qibla: string;
      from: string;
      geoError: string;
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
    chooseCity: string;
    chooseCityDesc: string;
    searchCity: string;
    locationTabBd: string;
    locationTabIntl: string;
    searchUpazila: string;
    noCityFound: string;
    locationOrLabel: string;
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
    fajrAdhanSound: string;
    fajrAdhanSoundDesc: string;
    selectAdhan: string;
    language: string;
    hijriAdjustment: string;
    hijriAdjustmentDesc: string;
    hijriAdjustmentDays: string;
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

  // Eid Countdown
  eidCountdown: {
    title: string;
    daysUntilEidFitr: string;
    daysUntilEidAdha: string;
    eidFitrToday: string;
    eidAdhaToday: string;
    eidDuaArabic: string;
    eidDuaTranslation: string;
    daysUntilRamadan: string;
    ramadanMubarak: string;
    days: string;
    day: string;
  };

  // Share
  share: {
    button: string;
    title: string;
    copied: string;
    failed: string;
    dialogTitle: string;
    dialogDescription: string;
    chooseBackground: string;
    shareImage: string;
    download: string;
    copyText: string;
    preparing: string;
    saved: string;
    cardFooter: string;
    bg: {
      emerald: string;
      midnight: string;
      golden: string;
      parchment: string;
      ocean: string;
      dusk: string;
      sand: string;
      paper: string;
    };
    opt: {
      size: string;
      sizePost: string;
      sizeStory: string;
      sizeSquare: string;
      style: string;
      styleClassic: string;
      styleMinimal: string;
      show: string;
      showVerse: string;
      showArabic: string;
      showHijri: string;
      showSunrise: string;
      message: string;
      messagePlaceholder: string;
    };
  };

  // Friday
  friday: {
    surahKahfReminder: string;
    surahKahfBody: string;
    jummahReminder: string;
    jummahBody: string;
  };

  // Daily Verse
  dailyVerse: {
    title: string;
    ayah: string;
    hadith: string;
    context: {
      fajr: string;
      morning: string;
      dhuhr: string;
      afternoon: string;
      asr: string;
      evening: string;
      maghrib: string;
      isha: string;
      night: string;
      friday: string;
      ramadan: string;
      laylatul_qadr: string;
      eid_fitr: string;
      eid_adha: string;
      dhul_hijjah: string;
      day_of_arafah: string;
      muharram: string;
      ashura: string;
      rajab: string;
      shaban: string;
      spring: string;
      summer: string;
      autumn: string;
      winter: string;
      general: string;
    };
  };

  // Word of the Day
  wordOfTheDay: {
    title: string;
    root: string;
    foundInQuran: string;
  };

  // Explore
  explore: {
    comparison: {
      title: string;
      addCity: string;
      removeCity: string;
      earliest: string;
      latest: string;
      spread: string;
    };
    globe: {
      title: string;
      citiesNow: string;
      tapCity: string;
    };
    tabComparison: string;
    tabGlobe: string;
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

  // Redesigned app shell and screens
  ui: {
    nav: {
      today: string;
      qibla: string;
      fasting: string;
      calendar: string;
      duas: string;
      schedule: string;
      explore: string;
      settings: string;
      more: string;
      main: string;
    };
    today: {
      until: string;
      hr: string;
      min: string;
      now: string;
      ends: string;
      fajrEnds: string;
      prayedOf: string;
      allDone: string;
      waiting: string;
      upToDate: string;
      accepted: string;
      dayStreak: string;
      didYouPray: string;
      startedAgo: string;
      endedAt: string;
      yesPrayed: string;
      thisWeek: string;
      tapCircle: string;
      marked: string;
      alertOn: string;
      alertOff: string;
      alertsNeedOn: string;
      prayedLabel: string;
      alertLabel: string;
      prevDay: string;
      nextDay: string;
      backToToday: string;
      curve: string;
      weekDay: string;
      changeLocation: string;
      nowLabel: string;
      nextAt: string;
      fastingToday: string;
      iftarIn: string;
      suhoorIn: string;
      fastOver: string;
      qiblaCard: string;
      qiblaFrom: string;
      openCompass: string;
      openFasting: string;
      verse: string;
      hadith: string;
      ramadanIn: string;
      eidFitrIn: string;
      eidAdhaIn: string;
      ramadanNow: string;
      calendarLink: string;
      todayTimes: string;
    };
    qibla: {
      subtitle: string;
      facing: string;
      turnRight: string;
      turnLeft: string;
      onTarget: string;
      onTargetSub: string;
      hint: string;
      left10: string;
      right10: string;
      useCompass: string;
      compassOn: string;
      yourQibla: string;
      direction: string;
      directionSub: string;
      distance: string;
      distanceSub: string;
      location: string;
      accuracy: string;
      flat: string;
      flatSub: string;
      calibrate: string;
      calibrateSub: string;
      map: string;
      west: string;
      east: string;
      north: string;
      south: string;
      dialLabel: string;
    };
    fasting: {
      iftarIn: string;
      suhoorIn: string;
      ofFast: string;
      eatBefore: string;
      suhoorEnds: string;
      iftar: string;
      length: string;
      alerts: string;
      alertsSub: string;
      thisWeek: string;
      sunnahNote: string;
      whiteDays: string;
      whiteDaysSub: string;
      makeup: string;
      makeupLeft: string;
      makeupNone: string;
      makeupSub: string;
      madeUp: string;
      added: string;
      oneLess: string;
      oneMore: string;
      inDays: string;
      tomorrow: string;
      today: string;
    };
    calendar: {
      subtitle: string;
      today: string;
      whiteDays: string;
      comingUp: string;
      noOccasion: string;
      inDays: string;
      prevMonth: string;
      nextMonth: string;
      thisMonth: string;
      newYear: string;
      ashura: string;
      rajab: string;
      shaban: string;
      ramadan: string;
      lastTen: string;
      eidFitr: string;
      arafah: string;
      eidAdha: string;
      whiteDay: string;
    };
    duas: {
      title: string;
      subtitle: string;
      all: string;
      saved: string;
      noSaved: string;
      copy: string;
      copied: string;
      save: string;
      savedToast: string;
      removed: string;
      count: string;
      progress: string;
      startAgain: string;
      subhanallah: string;
      alhamdulillah: string;
      allahuakbar: string;
      showMore: string;
    };
    settings: {
      subtitle: string;
      prayerTimes: string;
      alerts: string;
      perPrayer: string;
      appearance: string;
      locationAuto: string;
      adhanOn: string;
      off: string;
      reminder: string;
      standard: string;
      hanafi: string;
      preview: string;
      stop: string;
      bg: string;
      bgDesc: string;
      bgNone: string;
      bgGirih: string;
      bgDawn: string;
      bgDesert: string;
      bgBoth: string;
      bgStrength: string;
      bgSoft: string;
      bgMedium: string;
      bgStrong: string;
      bgColour: string;
      bgAuto: string;
      bgEmerald: string;
      bgGold: string;
      bgSidebar: string;
    };
    more: {
      calendarSub: string;
      scheduleSub: string;
      exploreSub: string;
      settingsSub: string;
    };
  };
}
