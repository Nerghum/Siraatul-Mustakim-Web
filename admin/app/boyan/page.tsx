"use client";

import { useBoyanList } from "@/hooks/use-boyan";
import type { Boyan } from "@/types/boyan";
import ReactAudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { Loader2, Mic } from "lucide-react";

export default function BoyanPublicPage() {
  const { data, isLoading, isError } = useBoyanList({ limit: 20 });
  const items = (data?.items as Boyan[]) || [];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <Mic className="size-10 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">বোয়ান</h1>
          <p className="text-muted-foreground">সর্বশেষ অডিও বোয়ান</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="text-center text-muted-foreground py-12">
            Failed to load boyan
          </p>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            কোনো বোয়ান পাওয়া যায়নি
          </p>
        )}

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item._id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.category}</span>
                    {item.author && (
                      <>
                        <span>·</span>
                        <span>{item.author}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {item.audioUrl && (
                <ReactAudioPlayer
                  src={item.audioUrl}
                  header={item.title}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
