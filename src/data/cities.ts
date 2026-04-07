/**
 * Offline city database — bundled lat/lon for major world cities.
 * Used for offline location selection when GPS is unavailable or
 * reverse geocoding cannot reach the network. Focused on Muslim-majority
 * countries plus major global cities.
 */

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  // Bangladesh
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'Chattogram', country: 'Bangladesh', lat: 22.3569, lon: 91.7832 },
  { name: 'Khulna', country: 'Bangladesh', lat: 22.8456, lon: 89.5403 },
  { name: 'Rajshahi', country: 'Bangladesh', lat: 24.3745, lon: 88.6042 },
  { name: 'Sylhet', country: 'Bangladesh', lat: 24.8949, lon: 91.8687 },
  { name: 'Barishal', country: 'Bangladesh', lat: 22.7010, lon: 90.3535 },
  { name: 'Rangpur', country: 'Bangladesh', lat: 25.7439, lon: 89.2752 },
  { name: 'Mymensingh', country: 'Bangladesh', lat: 24.7471, lon: 90.4203 },
  { name: 'Cumilla', country: 'Bangladesh', lat: 23.4607, lon: 91.1809 },
  { name: 'Narayanganj', country: 'Bangladesh', lat: 23.6238, lon: 90.5000 },
  { name: 'Gazipur', country: 'Bangladesh', lat: 23.9999, lon: 90.4203 },
  { name: 'Jessore', country: 'Bangladesh', lat: 23.1685, lon: 89.2072 },
  { name: 'Bogura', country: 'Bangladesh', lat: 24.8465, lon: 89.3776 },
  { name: 'Dinajpur', country: 'Bangladesh', lat: 25.6217, lon: 88.6354 },
  { name: 'Cox\u2019s Bazar', country: 'Bangladesh', lat: 21.4272, lon: 92.0058 },

  // Saudi Arabia
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.4225, lon: 39.8262 },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.5247, lon: 39.5692 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925 },
  { name: 'Dammam', country: 'Saudi Arabia', lat: 26.4207, lon: 50.0888 },
  { name: 'Taif', country: 'Saudi Arabia', lat: 21.2854, lon: 40.4183 },
  { name: 'Tabuk', country: 'Saudi Arabia', lat: 28.3838, lon: 36.5550 },

  // UAE
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773 },
  { name: 'Sharjah', country: 'UAE', lat: 25.3463, lon: 55.4209 },
  { name: 'Al Ain', country: 'UAE', lat: 24.2075, lon: 55.7447 },

  // Other Gulf
  { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310 },
  { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774 },
  { name: 'Manama', country: 'Bahrain', lat: 26.2285, lon: 50.5860 },
  { name: 'Muscat', country: 'Oman', lat: 23.5880, lon: 58.3829 },

  // Pakistan
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lon: 73.0479 },
  { name: 'Rawalpindi', country: 'Pakistan', lat: 33.5651, lon: 73.0169 },
  { name: 'Faisalabad', country: 'Pakistan', lat: 31.4504, lon: 73.1350 },
  { name: 'Multan', country: 'Pakistan', lat: 30.1575, lon: 71.5249 },
  { name: 'Peshawar', country: 'Pakistan', lat: 34.0151, lon: 71.5249 },
  { name: 'Quetta', country: 'Pakistan', lat: 30.1798, lon: 66.9750 },

  // India
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867 },
  { name: 'Lucknow', country: 'India', lat: 26.8467, lon: 80.9462 },
  { name: 'Srinagar', country: 'India', lat: 34.0837, lon: 74.7973 },

  // Turkey
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Ankara', country: 'Turkey', lat: 39.9334, lon: 32.8597 },
  { name: 'Izmir', country: 'Turkey', lat: 38.4192, lon: 27.1287 },
  { name: 'Bursa', country: 'Turkey', lat: 40.1828, lon: 29.0665 },

  // Iran
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lon: 51.3890 },
  { name: 'Mashhad', country: 'Iran', lat: 36.2605, lon: 59.6168 },
  { name: 'Isfahan', country: 'Iran', lat: 32.6546, lon: 51.6680 },

  // Iraq / Levant
  { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lon: 44.3661 },
  { name: 'Basra', country: 'Iraq', lat: 30.5085, lon: 47.7804 },
  { name: 'Mosul', country: 'Iraq', lat: 36.3490, lon: 43.1577 },
  { name: 'Erbil', country: 'Iraq', lat: 36.1911, lon: 44.0094 },
  { name: 'Damascus', country: 'Syria', lat: 33.5138, lon: 36.2765 },
  { name: 'Aleppo', country: 'Syria', lat: 36.2021, lon: 37.1343 },
  { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018 },
  { name: 'Amman', country: 'Jordan', lat: 31.9454, lon: 35.9284 },
  { name: 'Jerusalem', country: 'Palestine', lat: 31.7683, lon: 35.2137 },
  { name: 'Gaza', country: 'Palestine', lat: 31.5018, lon: 34.4663 },

  // Egypt / North Africa
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Alexandria', country: 'Egypt', lat: 31.2001, lon: 29.9187 },
  { name: 'Giza', country: 'Egypt', lat: 30.0131, lon: 31.2089 },
  { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lon: 32.5599 },
  { name: 'Tripoli', country: 'Libya', lat: 32.8872, lon: 13.1913 },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lon: 10.1815 },
  { name: 'Algiers', country: 'Algeria', lat: 36.7538, lon: 3.0588 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898 },
  { name: 'Rabat', country: 'Morocco', lat: 34.0209, lon: -6.8416 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lon: -7.9811 },

  // Sub-Saharan Africa
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Abuja', country: 'Nigeria', lat: 9.0765, lon: 7.3986 },
  { name: 'Kano', country: 'Nigeria', lat: 12.0022, lon: 8.5920 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
  { name: 'Mogadishu', country: 'Somalia', lat: 2.0469, lon: 45.3182 },
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.1450, lon: 40.4897 },
  { name: 'Dakar', country: 'Senegal', lat: 14.7167, lon: -17.4677 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473 },

  // South / Southeast Asia
  { name: 'Kabul', country: 'Afghanistan', lat: 34.5553, lon: 69.2075 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Surabaya', country: 'Indonesia', lat: -7.2575, lon: 112.7521 },
  { name: 'Bandung', country: 'Indonesia', lat: -6.9175, lon: 107.6191 },
  { name: 'Medan', country: 'Indonesia', lat: 3.5952, lon: 98.6722 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869 },
  { name: 'Johor Bahru', country: 'Malaysia', lat: 1.4927, lon: 103.7414 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Bandar Seri Begawan', country: 'Brunei', lat: 4.9031, lon: 114.9398 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.0278, lon: 105.8342 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297 },
  { name: 'Yangon', country: 'Myanmar', lat: 16.8409, lon: 96.1735 },
  { name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lon: 104.9282 },
  { name: 'Maldives (Male)', country: 'Maldives', lat: 4.1755, lon: 73.5093 },

  // East Asia
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  { name: 'Urumqi', country: 'China', lat: 43.8256, lon: 87.6168 },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },

  // Central Asia / Caucasus
  { name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lon: 69.2401 },
  { name: 'Samarkand', country: 'Uzbekistan', lat: 39.6542, lon: 66.9597 },
  { name: 'Almaty', country: 'Kazakhstan', lat: 43.2220, lon: 76.8512 },
  { name: 'Astana', country: 'Kazakhstan', lat: 51.1694, lon: 71.4491 },
  { name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.8746, lon: 74.5698 },
  { name: 'Dushanbe', country: 'Tajikistan', lat: 38.5598, lon: 68.7870 },
  { name: 'Ashgabat', country: 'Turkmenistan', lat: 37.9601, lon: 58.3261 },
  { name: 'Baku', country: 'Azerbaijan', lat: 40.4093, lon: 49.8671 },

  // Europe
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Manchester', country: 'United Kingdom', lat: 53.4808, lon: -2.2426 },
  { name: 'Birmingham', country: 'United Kingdom', lat: 52.4862, lon: -1.8904 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.5820 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
  { name: 'Saint Petersburg', country: 'Russia', lat: 59.9311, lon: 30.3609 },
  { name: 'Sarajevo', country: 'Bosnia & Herzegovina', lat: 43.8563, lon: 18.4131 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },

  // North America
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698 },
  { name: 'Dallas', country: 'USA', lat: 32.7767, lon: -96.7970 },
  { name: 'Washington DC', country: 'USA', lat: 38.9072, lon: -77.0369 },
  { name: 'Detroit', country: 'USA', lat: 42.3314, lon: -83.0458 },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },

  // Oceania
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lon: 115.8605 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633 },

  // South America
  { name: 'S\u00e3o Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
];
