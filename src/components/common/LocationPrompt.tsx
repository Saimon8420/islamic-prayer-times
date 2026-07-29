import { Navigation, Compass } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useLocation } from '../../hooks/useLocation';
import { useTranslation } from '../../i18n/useTranslation';

export const LocationPrompt = () => {
  const { loading, error, requestLocation } = useLocation();
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card className="overflow-hidden fade-in">
        <CardContent className="p-8 text-center">
          {/* ── crescent welcome ── */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.08]">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>

          <p className="label-mono !text-secondary">{t('location.greeting')}</p>
          <p className="arabic-text mt-2 text-2xl font-semibold text-foreground">السلام عليكم</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('location.welcome')}</p>

          <div className="my-6">
            <div className="heritage-rule" />
          </div>

          <h3 className="font-display text-xl font-semibold text-foreground">
            {t('location.setYourLocation')}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('location.locationNeeded')}</p>

          {error && (
            <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="mt-6 h-12 w-full text-lg"
            onClick={requestLocation}
            disabled={loading}
          >
            <Navigation className="me-2 h-5 w-5" />
            {loading ? t('location.gettingLocation') : t('location.useCurrentLocation')}
          </Button>

          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>{t('common.or')}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{t('location.privacyNote')}</p>

          {/* ── Features preview ── */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/[0.08]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path
                    d="M12 2v4M12 18v4M2 12h4M18 12h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-foreground">{t('location.featurePrayer')}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/[0.10]">
                <Compass className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-xs font-medium text-foreground">{t('location.featureQibla')}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/[0.08]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-foreground">{t('location.featureFasting')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
