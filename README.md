# Islamic Prayer Times & Fasting Schedule

A comprehensive Islamic prayer times and fasting schedule application built with React, TypeScript, and modern web technologies. This application provides accurate prayer times, Qibla direction, Hijri calendar, and fasting schedules for Muslims worldwide.

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

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **date-fns** - Date manipulation

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

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/prayertime-fastingtime-clientsite.git

# Navigate to project directory
cd prayertime-fastingtime-clientsite

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist\` directory.

## Usage

1. **Set Location**: On first visit, the app will prompt you to share your location. This is required for accurate prayer times and Qibla direction.

2. **View Prayer Times**: The main screen shows today's prayer times with countdown to the next prayer.

3. **Fasting Times**: Navigate to the Fasting tab to see Sahur and Iftar times with countdown.

4. **Qibla Direction**: Use the Qibla tab to find the direction to Makkah. For best results, hold your device flat.

5. **Monthly Schedule**: View the full month's prayer and fasting times in the Schedule tab.

6. **Settings**: Customize calculation method, madhab, theme, and time format in Settings.

## Privacy

- All calculations are performed locally on your device
- Location data is stored only in your browser's local storage
- No data is sent to external servers for calculations
- Location is used solely to calculate prayer times and Qibla direction

## Credits

### Libraries
- [Adhan](https://github.com/batoulapps/adhan-js) - Islamic prayer time calculations (MIT License)
- [hijri-converter](https://github.com/AliYmn/hijri-converter) - Hijri calendar conversions (MIT License)
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
