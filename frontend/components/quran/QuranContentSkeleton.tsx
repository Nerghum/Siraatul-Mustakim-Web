import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/quran.module.css";

interface QuranContentSkeletonProps {
  mode: "translation" | "recitation" | "tafsir";
}

export default function QuranContentSkeleton({ mode }: QuranContentSkeletonProps) {
  if (mode === "recitation") {
    return (
      <div className={styles.recitationContainer} style={{ opacity: 0.7 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
          <SkeletonBar className="w-full h-[2.2rem]" />
          <SkeletonBar className="w-[94%] h-[2.2rem]" />
          <SkeletonBar className="w-full h-[2.2rem]" />
          <SkeletonBar className="w-[88%] h-[2.2rem]" />
          <SkeletonBar className="w-[96%] h-[2.2rem]" />
          <SkeletonBar className="w-[75%] h-[2.2rem]" />
        </div>
      </div>
    );
  }

  if (mode === "tafsir") {
    return (
      <div className={styles.tafsirContinuous} style={{ opacity: 0.7 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
          <SkeletonBar className="w-full h-[1.1rem]" />
          <SkeletonBar className="w-full h-[1.1rem]" />
          <SkeletonBar className="w-[95%] h-[1.1rem]" />
          <SkeletonBar className="w-full h-[1.1rem]" />
          <SkeletonBar className="w-[90%] h-[1.1rem]" />
          <SkeletonBar className="w-full h-[1.1rem]" />
          <SkeletonBar className="w-[80%] h-[1.1rem]" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {[1, 2, 3].map((key) => (
        <article key={key} className={styles.ayahCard} style={{ opacity: 0.7 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <SkeletonBar className="w-[65%] h-[2rem]" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <SkeletonBar className="w-[85%] h-[1rem]" />
            <SkeletonBar className="w-full h-[1rem]" />
          </div>
        </article>
      ))}
    </div>
  );
}
