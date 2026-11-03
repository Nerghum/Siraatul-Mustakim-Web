import { Calendar, Eye } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/notice.module.css";
import type { NoticeItem } from "@/types/notice";

type NoticeCardProps = {
  notice: NoticeItem;
};

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const { locale } = useLocale();
  const isGreen = notice.styleType === "green";
  const cardClass = isGreen ? styles.variantGreen : styles.variantAmber;
  const iconClass = isGreen ? styles.cardIconGreen : styles.cardIconAmber;
  const noticeId = notice.id || notice._id;
  const excerptText = notice.excerpt || notice.description;

  return (
    <Link
      href={`/notice/${noticeId}`}
      className={cn(styles.noticeCard, cardClass, "block hover:opacity-90 transition-opacity")}
    >
      <div className={styles.cardHeader}>
        <Calendar className={iconClass} />
        <h3 className={styles.cardTitle}>{notice.title}</h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardMeta} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {notice.timeLabel ? <span>{notice.timeLabel}</span> : <span />}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", opacity: 0.85 }}>
            <Eye className="w-3.5 h-3.5" />
            {toLocalizedNumber((notice.views || 0).toLocaleString("en-US"), locale)}
          </span>
        </div>
        {excerptText ? (
          <p className={styles.cardExcerpt}>{excerptText}</p>
        ) : null}
      </div>
    </Link>
  );
};
