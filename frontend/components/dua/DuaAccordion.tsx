"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import type { DuaCategory } from "@/data/mockDua";
import { cn } from "@/lib/utils";
import DuaAccordionSkeleton from "./DuaAccordionSkeleton";
import styles from "./dua.module.css";

type DuaAccordionProps = {
  categories?: DuaCategory[];
  loading?: boolean;
};

const DuaAccordion: React.FC<DuaAccordionProps> = ({ categories, loading }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  // Auto open first category when loaded if not yet set
  React.useEffect(() => {
    if (categories && categories.length > 0 && openId === null) {
      setOpenId(categories[0].id);
    }
  }, [categories, openId]);

  if (loading || !categories) {
    return <DuaAccordionSkeleton />;
  }

  if (categories.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        কোনো দুআ বা অধ্যায় পাওয়া যায়নি
      </div>
    );
  }

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.accordionList}>
      {categories.map((cat) => {
        const isOpen = openId === cat.id;

        return (
          <div key={cat.id} className={cn(styles.accordionBox, isOpen && styles.expanded)}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => toggleAccordion(cat.id)}
            >
              <span className={styles.accordionTitle}>{cat.title}</span>
              <ChevronDown className={styles.accordionIcon} />
            </button>

            {isOpen && (
              <div className={styles.accordionContent}>
                {cat.items && cat.items.length > 0 ? (
                  cat.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href || `/dua/${cat.id}?dua=${item.id}`}
                      className={styles.duaItem}
                    >
                      {item.title}
                      <ChevronRight className={styles.duaItemIcon} />
                    </Link>
                  ))
                ) : (
                  <Link href={`/dua/${cat.id}`} className={styles.duaItem}>
                    সকল দুআ দেখুন
                    <ChevronRight className={styles.duaItemIcon} />
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DuaAccordion;
