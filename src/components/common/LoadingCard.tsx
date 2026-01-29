import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface LoadingCardProps {
  type?: 'prayer' | 'fasting' | 'qibla';
}

export const LoadingCard = ({ type = 'prayer' }: LoadingCardProps) => {
  if (type === 'qibla') {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="h-48 w-48 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (type === 'fasting') {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
