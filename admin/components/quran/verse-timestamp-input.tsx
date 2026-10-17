"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secondsToTimestamp, timestampToSeconds } from "@/lib/utils";

interface VerseTimestampInputProps {
  value: number;
  onChange: (seconds: number) => void;
  maxDuration?: number | null;
  onUseCurrentTime?: () => void;
  /** Whether to show the "Use Current Time" button */
  showUseCurrentTime?: boolean;
  className?: string;
}

export function VerseTimestampInput({
  value,
  onChange,
  maxDuration,
  onUseCurrentTime,
  showUseCurrentTime = false,
  className,
}: VerseTimestampInputProps) {
  const [displayValue, setDisplayValue] = useState(secondsToTimestamp(value));
  const [isEditing, setIsEditing] = useState(false);

  // Sync display when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(secondsToTimestamp(value));
    }
  }, [value, isEditing]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const parsed = timestampToSeconds(displayValue);

    if (Number.isFinite(parsed) && parsed >= 0) {
      // Validate against max duration
      if (
        maxDuration !== null &&
        maxDuration !== undefined &&
        parsed > maxDuration
      ) {
        setDisplayValue(secondsToTimestamp(maxDuration));
        onChange(maxDuration);
      } else {
        onChange(parsed);
      }
    } else {
      // Reset to current value on invalid input
      setDisplayValue(secondsToTimestamp(value));
    }
  }, [displayValue, value, maxDuration, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="relative flex-1">
        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          type="text"
          className="pl-8 font-mono text-sm tabular-nums"
          placeholder="00:00.000"
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            setIsEditing(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showUseCurrentTime && onUseCurrentTime && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 text-xs"
          onClick={onUseCurrentTime}
        >
          <Clock className="size-3 mr-1" />
          Current
        </Button>
      )}
    </div>
  );
}
