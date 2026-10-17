"use client";

import { Calendar, User } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { formatLocalizedShortDate } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/listing.module.css";
import card from "@/styles/listing-card.module.css";
import type { ListingItem } from "@/types/listing";

type ListingCardProps = {
  item: ListingItem;
  /** Link prefix — "/articles" yields /articles/3. */
  basePath: string;
};

const ListingCard: React.FC<ListingCardProps> = ({ item, basePath }) => {
  const { locale } = useLocale();

  const href = `${basePath}/${item.id}`;

  return (
    <Link href={href} className={styles.card}>
      <h3 className={styles.cardTitle}>{item.title}</h3>

      {/* Unlike the Q&A card there is no question-number line here — the title
          flows straight into the excerpt. */}
      <p className={cn(styles.cardExcerpt, card.cardExcerpt)}>{item.excerpt}</p>

      <div className={styles.metaRow}>
        <span className={styles.metaItemAuthor}>
          <User className={styles.metaIcon} />
          <span className="truncate" title={item.author}>
            {item.author}
          </span>
        </span>

        <span className={styles.metaItemDate}>
          <Calendar className={styles.metaIcon} />
          {formatLocalizedShortDate(item.date, locale)}
        </span>
      </div>
    </Link>
  );
};

export default ListingCard;
