import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PageSkeleton() {
   return (
    <>
      <style>{`
        .spinner-bars-bar {
          height: 6px;
          animation: spinner-bars 0.8s ease-in-out infinite;
        }
        @keyframes spinner-bars {
          0%, 100% { height: 6px; }
          50% { height: 20px; }
        }
      `}</style>
      <div className="flex items-end gap-1 h-5">
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            className="w-1.5 rounded-sm bg-current spinner-bars-bar"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-28 mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}
