import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card px-4 py-12 text-center shadow-sm">
      <div className="mb-4 grid size-12 place-items-center rounded-lg bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-destructive">Error</h3>
      <p className="mt-1 mb-4 max-w-md text-sm text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
