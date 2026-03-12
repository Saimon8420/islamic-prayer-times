# Islamic Prayer Times & Fasting Schedule

A comprehensive Islamic prayer times and fasting schedule application built with React, TypeScript, and modern web technologies. Available as a **Progressive Web App (PWA)**, a **web app**, and a **native Android app** with prayer time notifications and adhan sounds.

[![Download APK](https://img.shields.io/badge/Download-APK-green?style=for-the-badge&logo=android)](https://github.com/Saimon8420/islamic-prayer-times/releases/latest/download/islamic-prayer-times.apk)

> Click the badge above to download and install the latest Android APK directly on your device.

---

## Features

### Prayer Times
- Accurate prayer time calculations for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha
- Support for 12 different calculation methods used worldwide
- Two madhab options for Asr calculation (Shafi/Standard and Hanafi)
- Real-time countdown to the next prayer with `h m s` format and optional seconds toggle
- Visual progress indicator showing time between prayers
- Additional times: Imsak, Islamic Midnight, Last Third of Night, and Makruh times (Sunrise, Solar Noon, Sunset)
- Sky tracker SVG arc showing real-time sun/moon position

### Fasting Schedule
- Sehri end time (Fajr-based, per Quran 2:187) with countdown
- Iftar time with countdown
- Fasting duration calculation with progress indicator
- White Days (Ayyam Al-Beed) tracker — 13th, 14th, 15th of each Islamic month with Hijri adjustment support

### Eid & Ramadan Countdown
- Year-round countdown cycle: **Ramadan → Eid ul-Fitr → Eid ul-Adha → back to Ramadan**
- Always shows the nearest upcoming Islamic event
- Special Eid Mubarak greeting with dua (تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ) on Eid day
- Hijri adjustment aware — respects local moon sighting settings
- Distinct gradient styles: navy for Ramadan, emerald for Eid countdown, gold for Eid day

### Daily Ayah & Hadith
- 126 curated entries — 71 Quranic ayahs and 55 authentic hadiths
- Sources include Sahih al-Bukhari, Sahih Muslim, Jami at-Tirmidhi, Sunan Ibn Majah, Musnad Ahmad
- Arabic text with English and Bengali translations
- Changes daily (same verse all day, cycles every ~4 months)
- Fully offline — all data bundled locally, zero API calls
- Arabian/Mamluk styled card with distinct gradients for Quran vs Hadith

### Share Prayer Times
- Share button on the Prayer Times card
- Generates beautifully formatted text with emoji icons, dot-leader alignment, Hijri date, and Quranic verse
- Uses Web Share API on mobile (triggers native Android share sheet) with clipboard fallback on desktop
- Visual feedback: checkmark on success, auto-resets after 2 seconds

### Qibla Direction
- Precise Qibla direction calculation based on your location
- 8-direction compass (N/NE/E/SE/S/SW/W/NW) with degree labels at 30° intervals
- Distance to Makkah display
- Arabian/Mamluk aesthetic with tessellation overlay and arabesque corners

### Hijri Calendar
- Accurate Gregorian to Hijri date conversion
- Hijri date advances at Maghrib (sunset), not midnight — following Islamic tradition
- Hijri date adjustment (-2 to +2 days) for local moon sighting differences
- Full monthly calendar grid with occasion highlighting
- Arabic, Bengali, and English date display
- Special Islamic day detection: Eid ul-Fitr, Eid ul-Adha, Day of Arafah, Laylatul Qadr, Days of Tashriq

### Islamic Occasion Greeting Banners
- Automatic detection of 6 Islamic occasions based on the Hijri date
- Contextual greeting banners with Arabic calligraphy, authentic duas with references, and recommended rituals
- Supported occasions: **Ramadan**, **Laylatul Qadr** (odd nights 21–29), **Eid ul-Fitr**, **Eid ul-Adha**, **Day of Arafah**, **Days of Tashriq**
- Occasion-specific decorative SVG graphics and themed gradient colors
- Mobile-responsive with expand/collapse sections
- Full multilingual support (English, Bengali, Arabic)

### Dua Collection
- 200+ authentic duas with Arabic text, transliteration, and translation
- 16 categories including Prayer, Morning & Evening, Food & Drink, Travel, Sleep, Protection, Forgiveness, Hajj & Umrah, and more
- Search functionality across all duas
- Background and history for each dua

### Monthly Schedule
- Full month prayer times table
- Full month fasting times table
- Navigate between months
- Today's date highlighting

### Notifications & Adhan

#### Web Notifications
- Browser notification API with HTML5 Audio playback
- Polls every 30 seconds and fires at prayer time
- Separate Fajr adhan (with "الصلاة خير من النوم") and regular adhan selection
- Silent notifications for Sehri and Iftar (default device sound, no adhan)
- Friday reminders: Surah Al-Kahf at Fajr, Jummah preparation 1 hour before Dhuhr
- Auto-stop audio when notification is closed

#### Android Native Notifications
- Scheduled via Capacitor LocalNotifications, 3 days ahead
- `allowWhileIdle: true` — fires even in Android Doze mode
- Refreshed on app launch, settings change, or app resume
- Separate notification channels per adhan sound (deleted + recreated to avoid Android caching)
- Friday reminders: Surah Al-Kahf and Jummah notifications

#### Adhan Sound Options

**Regular Adhan** (Dhuhr, Asr, Maghrib, Isha):
| Option | File |
|--------|------|
| Mishary Rashid Alafasy | `alafasy_regular.mp3` |
| Makkah — Sheikh Ali Mullah | `makkah_regular.mp3` |
| Madinah | `madinah_regular.mp3` |
| Default Sound | Device notification sound |
| Silent | No sound |

**Fajr Adhan** (separate selection):
| Option | File |
|--------|------|
| Mishary Rashid Alafasy (Fajr) | `alafasy_fajr.mp3` |
| Makkah — Sheikh Ali Mullah (Fajr) | `makkah_fajr.mp3` |
| Default Sound | Device notification sound |
| Silent | No sound |

Adhan preview available in settings — play/stop button for the selected sound.

### Offline PWA Support
- Installable as a Progressive Web App on any device
- Service worker with Workbox precaches app shell (JS, CSS, HTML, fonts)
- Adhan audio files cached at runtime (CacheFirst, 1-year expiry) for fast initial load
- Works fully offline — all prayer calculations are client-side
- Auto-updates when new version is deployed

### Multilingual Support (i18n)
- **English**, **Bengali (বাংলা)**, and **Arabic (العربية)** fully supported
- Automatic RTL layout for Arabic
- Localized date formatting using `toLocaleDateString()` — dates display in the selected language
- All UI elements, prayer names, duas, occasion greetings, daily verses, and settings translated
- Language can be switched from Settings

### Design System (Arabian/Mamluk Theme)
- **Light mode**: Warm sand base, deep emerald primary, desert gold secondary
- **Dark mode**: Arabian night palette, glowing gold accents, emerald highlights
- Fonts: Poppins (English), Noto Sans Bengali, Noto Sans Arabic, Amiri/Scheherazade (decorative)
- Arabesque tessellation backgrounds, 8-pointed star motifs, horseshoe arch headers
- Hanging lanterns with swaying animation, mosque skyline silhouettes, gold shimmer sweep
- Parchment effect cards with arabesque corner ornaments and gold+emerald gradient borders
- Dark/Light/System theme support

---

## Android App (Capacitor)

The web app is wrapped with **Capacitor 7** to produce a native Android APK — no separate codebase, same React UI.

### Android Permissions
| Permission | Purpose |
|-----------|---------|
| `POST_NOTIFICATIONS` | Show prayer time notifications |
| `SCHEDULE_EXACT_ALARM` | Fire notifications at exact prayer times |
| `USE_EXACT_ALARM` | Android 14+ exact alarm support |
| `VIBRATE` | Vibrate on notification |
| `WAKE_LOCK` | Ensure notifications fire when screen is off |
| `RECEIVE_BOOT_COMPLETED` | Reschedule notifications after device restart |

### Download & Install

1. **Download the APK**: Click the download badge at the top of this page, or go to the [Releases page](https://github.com/Saimon8420/islamic-prayer-times/releases)
2. **Enable "Install from unknown sources"** in your Android settings if prompted
3. **Open the downloaded APK** and tap Install
4. **Grant location permission** when the app asks — required for accurate prayer times
5. **Enable notifications** in Settings within the app

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 3 |
| State Management | Zustand 5 (with persist) |
| Prayer Calculations | Adhan 4 |
| Islamic Calendar | hijri-converter |
| Date Utilities | date-fns 4 |
| Icons | lucide-react |
| UI Components | Radix UI (headless) |
| PWA | vite-plugin-pwa (Workbox) |
| Native Wrapper | Capacitor 7 |
| Notifications | @capacitor/local-notifications |
| CI/CD | GitHub Actions |

## Key Libraries

### Adhan
Prayer time calculations are powered by [Adhan](https://github.com/batoulapps/adhan-js), an open-source library for calculating Islamic prayer times. Adhan provides:
- High precision prayer time calculations
- Support for multiple calculation methods
- Qibla direction calculation
- Madhab-specific Asr calculations

### hijri-converter
Hijri calendar conversions are powered by [hijri-converter](https://github.com/AliYmn/hijri-converter), providing accurate conversions between Gregorian and Hijri (Islamic) calendar dates.

## Calculation Methods Supported

| Method | Organization |
|--------|-------------|
| Muslim World League | International |
| Egyptian | Egyptian General Authority of Survey |
| Karachi | University of Islamic Sciences, Karachi |
| Umm Al-Qura | Umm Al-Qura University, Makkah |
| Dubai | Dubai |
| Moonsighting Committee | Moonsighting Committee Worldwide |
| ISNA | Islamic Society of North America |
| Kuwait | Kuwait |
| Qatar | Qatar |
| Singapore | Majlis Ugama Islam Singapura |
| Turkey | Diyanet Isleri Baskanligi |
| Tehran | Institute of Geophysics, University of Tehran |

## Madhab Options

For Asr prayer calculation:
- **Shafi (Standard)** - Used by Shafi'i, Maliki, and Hanbali schools
- **Hanafi** - Used by the Hanafi school

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Saimon8420/islamic-prayer-times.git

# Navigate to project directory
cd islamic-prayer-times

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Build Android APK Locally

```bash
# Build web + sync + assemble debug APK
npm run build:apk
```

Requires Android SDK and JDK 17. The APK will be at `android/app/build/outputs/apk/debug/islamic-prayer-times.apk`.

### Other Capacitor Commands

```bash
# Sync web assets to Android project
npm run cap:sync

# Open Android project in Android Studio
npm run cap:open
```

### Adding Adhan Sound Files

Place MP3 files in both `public/audio/adhan/` (for web) and `android/app/src/main/res/raw/` (for Android native notifications):

```
public/audio/adhan/
  alafasy_regular.mp3
  alafasy_fajr.mp3
  makkah_regular.mp3
  makkah_fajr.mp3
  madinah_regular.mp3

android/app/src/main/res/raw/
  alafasy_regular.mp3
  alafasy_fajr.mp3
  makkah_regular.mp3
  makkah_fajr.mp3
  madinah_regular.mp3
```

Android notification sound names use the filename without extension (e.g., `alafasy_regular`). If a file is missing, the app falls back to the device default notification sound.

---

## Automated APK Builds (CI/CD)

The project includes a GitHub Actions workflow (`.github/workflows/build-apk.yml`) that:

1. **Triggers** on git tag push (`v*`) or manual dispatch
2. **Builds** the web app and syncs with Capacitor
3. **Assembles** a debug APK with Gradle
4. **Uploads** the APK as a GitHub artifact
5. **Creates** a GitHub Release with the APK attached

To trigger a release:

```bash
git tag v1.2.0
git push origin v1.2.0
```

---

## Project Structure

```
src/
  components/       UI components (prayer, fasting, qibla, dua, calendar, common, layout)
  hooks/            React hooks (useLocation, useTheme, useNotifications, useHijriDate, useLanguage)
  i18n/             Internationalization (en, bn, ar translations & useTranslation hook)
  services/         Business logic (prayerService, hijriService, notificationService, platformService)
  store/            Zustand state management (persisted settings)
  data/             Static data (duas collection, daily verses)
  types/            TypeScript types
  utils/            Utility functions (time formatting, distance calc, cardinal directions)
  lib/              Shared utilities (cn class merger)
public/
  audio/adhan/      Offline adhan MP3 files (~11MB)
  icons/            PWA icons (192x192, 512x512)
android/            Capacitor Android project
.github/workflows/  CI/CD for APK builds
```

## Usage

1. **Set Location**: On first visit, the app will prompt you to share your location. This is required for accurate prayer times and Qibla direction.
2. **View Prayer Times**: The main screen shows today's prayer times with countdown to the next prayer, daily inspiration verse, and Eid/Ramadan countdown.
3. **Share Prayer Times**: Tap the share button on the prayer card to share today's times via WhatsApp, messaging apps, or copy to clipboard.
4. **Fasting Times**: Navigate to the Fasting tab to see Sehri and Iftar times with countdown and White Days tracker.
5. **Qibla Direction**: Use the Qibla tab to find the direction to Makkah. For best results, hold your device flat.
6. **Hijri Calendar**: View the full Hijri calendar with occasion highlighting in the Hijri Calendar tab.
7. **Duas**: Browse 200+ authentic duas across 16 categories in the Duas tab.
8. **Monthly Schedule**: View the full month's prayer and fasting times in the Schedule tab.
9. **Settings**: Customize calculation method, madhab, theme, language, time format, Hijri adjustment, and notification/adhan preferences.

## Privacy

- All calculations are performed locally on your device
- Location data is stored only in your browser's local storage (web) or app storage (Android)
- No data is sent to external servers for calculations
- Location is used solely to calculate prayer times and Qibla direction
- No analytics, tracking, or third-party services

## Credits

### Libraries
- [Adhan](https://github.com/batoulapps/adhan-js) - Islamic prayer time calculations (MIT License)
- [hijri-converter](https://github.com/AliYmn/hijri-converter) - Hijri calendar conversions (MIT License)
- [Capacitor](https://capacitorjs.com/) - Native runtime for web apps (MIT License)
- [Zustand](https://github.com/pmndrs/zustand) - State management (MIT License)
- [date-fns](https://github.com/date-fns/date-fns) - Date utilities (MIT License)
- [Lucide React](https://github.com/lucide-icons/lucide) - Icons (ISC License)
- [Tailwind CSS](https://tailwindcss.com/) - Styling (MIT License)
- [Radix UI](https://www.radix-ui.com/) - UI primitives (MIT License)
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) - PWA support (MIT License)

### Geocoding
- [OpenStreetMap Nominatim](https://nominatim.org/) - Reverse geocoding for location names

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the creators of Adhan for providing accurate prayer time calculations
- Thanks to the Islamic community for testing and feedback
- May Allah accept our efforts in serving the Muslim Ummah

---

**Bismillah** - In the name of Allah, the Most Gracious, the Most Merciful

*Built with love for the Muslim Ummah*
