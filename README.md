# Islamic Prayer Times & Fasting Schedule

A comprehensive Islamic prayer times and fasting schedule application built with React, TypeScript, and modern web technologies. Available as both a **web app** and a **native Android app** with prayer time notifications and adhan sounds.

[![Download APK](https://img.shields.io/badge/Download-APK-green?style=for-the-badge&logo=android)](https://github.com/Saimon8420/islamic-prayer-times/releases/latest/download/islamic-prayer-times.apk)

> Click the badge above to download and install the latest Android APK directly on your device.

---

## Features

### Prayer Times
- Accurate prayer time calculations for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha
- Support for 12 different calculation methods used worldwide
- Two madhab options for Asr calculation (Shafi/Standard and Hanafi)
- Real-time countdown to the next prayer
- Visual progress indicator showing time between prayers
- Additional times: Imsak, Islamic Midnight, and Last Third of Night

### Fasting Schedule
- Sahur (Sehri) end time with countdown
- Iftar time with countdown
- Fasting duration calculation
- Progress indicator during fasting
- Ramadan awareness with countdown to Ramadan

### Qibla Direction
- Precise Qibla direction calculation based on your location
- Interactive compass with device orientation support
- Distance to Makkah display
- Visual compass pointing to the Holy Kaaba

### Hijri Calendar
- Accurate Gregorian to Hijri date conversion
- Arabic and English date display
- White Days (Ayyam Al-Beed) tracker - 13th, 14th, 15th of each Islamic month

### Monthly Schedule
- Full month prayer times table
- Full month fasting times table
- Navigate between months
- Today's date highlighting

### User Experience
- Beautiful Islamic-themed UI with gradient designs
- Dark/Light/System theme support
- 24-hour or 12-hour time format option
- Responsive design for all screen sizes
- Offline-capable with local calculations
- Settings persist locally

---

## Android App (Capacitor)

The web app is wrapped with **Capacitor 7** to produce a native Android APK — no separate codebase, same React UI.

### Prayer Notifications
- Notifications for all 5 daily prayers + Sehri, Iftar, and Sunrise
- Scheduled 3 days ahead and refreshed on app launch, settings change, or app resume
- `allowWhileIdle: true` — notifications fire even in Android Doze mode

### Multiple Adhan Sounds
Choose from 4 adhan recitations or use the device default:

| Option | Sound File |
|--------|-----------|
| Makkah | `adhan_makkah.mp3` |
| Madinah | `adhan_madinah.mp3` |
| Mishary Alafasy | `adhan_alafasy.mp3` |
| Abdul Basit | `adhan_abdulbasit.mp3` |
| Default Sound | Device notification sound |
| Silent | No sound |

Each adhan variant gets its own Android notification channel, so switching between them works reliably.

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

Place MP3 files in `android/app/src/main/res/raw/`:

```
android/app/src/main/res/raw/
  adhan_makkah.mp3
  adhan_madinah.mp3
  adhan_alafasy.mp3
  adhan_abdulbasit.mp3
```

If a file is missing, the app falls back to the device default notification sound.

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
git tag v1.0.0
git push origin v1.0.0
```

---

## Project Structure

```
src/
  components/       UI components (prayer, fasting, qibla, settings, layout)
  hooks/            React hooks (useLocation, useTheme, useNotifications)
  services/         Business logic (prayerService, notificationService, platformService)
  store/            Zustand state management
  types/            TypeScript types
  utils/            Utility functions
android/            Capacitor Android project
.github/workflows/  CI/CD for APK builds
```

## Usage

1. **Set Location**: On first visit, the app will prompt you to share your location. This is required for accurate prayer times and Qibla direction.
2. **View Prayer Times**: The main screen shows today's prayer times with countdown to the next prayer.
3. **Fasting Times**: Navigate to the Fasting tab to see Sahur and Iftar times with countdown.
4. **Qibla Direction**: Use the Qibla tab to find the direction to Makkah. For best results, hold your device flat.
5. **Monthly Schedule**: View the full month's prayer and fasting times in the Schedule tab.
6. **Settings**: Customize calculation method, madhab, theme, time format, and notification preferences.

## Privacy

- All calculations are performed locally on your device
- Location data is stored only in your browser's local storage (web) or app storage (Android)
- No data is sent to external servers for calculations
- Location is used solely to calculate prayer times and Qibla direction

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
