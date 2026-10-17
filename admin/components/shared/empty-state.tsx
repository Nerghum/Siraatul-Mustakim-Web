import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({
  message = "No data found",
  description = "No records to display.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-lg bg-muted">
        <Inbox className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{message}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
