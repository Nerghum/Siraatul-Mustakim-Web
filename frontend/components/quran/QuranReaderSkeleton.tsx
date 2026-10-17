import Wrapper from "@/components/wrapper";
import MobileTopBar from "@/components/shared/MobileTopBar";
import QuranContentSkeleton from "@/components/quran/QuranContentSkeleton";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/quran.module.css";

export default function QuranReaderSkeleton() {
  return (
    <section className={styles.section}>
      <MobileTopBar />
      <div className={styles.mobileBar}>
        <div style={{ width: 24, height: 24 }} />
        <SkeletonBar className="w-[140px] h-[1.2rem]" />
        <div style={{ width: 60, height: 28 }} />
      </div>
      <Wrapper className={styles.readerWrapper}>
        <div style={{ marginBottom: "1rem" }}>
          <SkeletonBar className="w-[120px] h-[1.25rem]" />
        </div>

        <div className={styles.readerHeader}>
          <div className={styles.readerTitle}>
            <SkeletonBar className="w-[280px] h-[2rem]" />
            <div className={styles.readerMeta} style={{ marginTop: "0.5rem" }}>
              <SkeletonBar className="w-[60px] h-[1.5rem] rounded-full" />
              <SkeletonBar className="w-[90px] h-[1.5rem] rounded-full" />
              <SkeletonBar className="w-[70px] h-[1.5rem] rounded-full" />
            </div>
          </div>
          <div className={styles.modeTabs}>
            <SkeletonBar className="w-[80px] h-[2.5rem] rounded-md" />
            <SkeletonBar className="w-[80px] h-[2.5rem] rounded-md" />
            <SkeletonBar className="w-[80px] h-[2.5rem] rounded-md" />
          </div>
        </div>

        <div className={styles.readerGrid}>
          <aside className={styles.readerSidebar}>
            <div className={styles.sidebarTabs}>
              <SkeletonBar className="w-full h-[2.8rem]" />
              <SkeletonBar className="w-full h-[2.8rem]" />
            </div>
            <div className={styles.sidebarSearch}>
              <SkeletonBar className="w-full h-[2.75rem]" />
            </div>
            <div className={styles.sidebarRows} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.8rem 1rem" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
                  <SkeletonBar className="w-[45%] h-[1rem]" />
                  <SkeletonBar className="w-[30%] h-[1rem]" />
                </div>
              ))}
            </div>
          </aside>

          <div className={styles.readerContent}>
            <QuranContentSkeleton mode="translation" />
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
