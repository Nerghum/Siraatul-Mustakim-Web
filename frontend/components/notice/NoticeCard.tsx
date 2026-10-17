import { Calendar } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { cn } from "@/lib/utils";
import styles from "@/styles/notice.module.css";
import type { NoticeItem } from "@/types/notice";

type NoticeCardProps = {
  notice: NoticeItem;
};

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
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
        {notice.timeLabel ? (
          <p className={styles.cardMeta}>{notice.timeLabel}</p>
        ) : null}
        {excerptText ? (
          <p className={styles.cardExcerpt}>{excerptText}</p>
        ) : null}
      </div>
    </Link>
  );
};
