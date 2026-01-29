import { MapPin, Navigation, Compass } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useLocation } from '../../hooks/useLocation';

// Kaaba Icon
const KaabaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
    <rect x="4" y="6" width="16" height="16" rx="1" fill="currentColor" />
    <path d="M4 8h16M4 12h16M4 16h16M4 20h16" stroke="white" strokeWidth="0.5" opacity="0.3" />
    <path d="M8 6V4a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="14" r="2" fill="white" opacity="0.8" />
  </svg>
);

// Mosque Silhouette
const MosqueSilhouette = () => (
  <svg viewBox="0 0 200 60" className="w-full h-auto opacity-10 absolute bottom-0 left-0">
    <path
      d="M0,60 L0,45 Q10,35 20,45 L20,40 Q25,30 30,40 L30,35 Q40,20 50,35 L50,45 Q60,35 70,45 L70,40 Q80,25 90,40 L90,35 Q100,15 110,35 L110,40 Q120,25 130,40 L130,45 Q140,35 150,45 L150,40 Q155,30 160,40 L160,35 Q170,20 180,35 L180,45 Q190,35 200,45 L200,60 Z"
      fill="currentColor"
    />
  </svg>
);

export const LocationPrompt = () => {
  const { loading, error, requestLocation } = useLocation();

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 islamic-pattern-bg rounded-3xl opacity-50" />

      <Card className="islamic-border overflow-hidden relative">
        {/* Header */}
        <div className="islamic-gradient p-8 text-white text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="crescent-decoration w-40 h-40 -top-10 -right-10" />
          <div className="crescent-decoration w-32 h-32 -bottom-8 -left-8 rotate-180" />

          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <KaabaIcon />
            </div>
            <h2 className="text-2xl font-bold mb-2">Assalamu Alaikum</h2>
            <p className="text-3xl arabic-text mb-2">السلام عليكم</p>
            <p className="text-white/80 text-sm">Welcome to Prayer Times</p>
          </div>

          <MosqueSilhouette />
        </div>

        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Set Your Location</h3>
            <p className="text-muted-foreground">
              To show accurate prayer times and Qibla direction, we need your location.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            className="w-full h-12 text-lg islamic-gradient hover:opacity-90"
            onClick={requestLocation}
            disabled={loading}
          >
            <Navigation className="mr-2 h-5 w-5" />
            {loading ? 'Getting Location...' : 'Use My Current Location'}
          </Button>

          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Your location is stored locally and used only for calculating prayer times.
          </p>

          {/* Features preview */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs font-medium">Prayer Times</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 mx-auto rounded-lg bg-secondary/20 flex items-center justify-center mb-2">
                <Compass className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-xs font-medium">Qibla</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 mx-auto rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
                </svg>
              </div>
              <p className="text-xs font-medium">Fasting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
