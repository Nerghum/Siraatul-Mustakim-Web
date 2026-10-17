import { useState, useEffect } from "react";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export interface Settings {
  _id: string;
  isQuestionsEnabled: boolean;
}

export function useSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/api/settings`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    settings: data,
    isLoading,
    isError: error,
  };
}
