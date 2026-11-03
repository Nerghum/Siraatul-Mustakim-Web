"use client";

import { User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";

type AuthorBlockProps = {
  name: string;
  avatar?: string;
  clickable?: boolean;
};

const AuthorBlock: React.FC<AuthorBlockProps> = ({ name, avatar, clickable = true }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  const content = (
    <>
      <span className={styles.authorAvatar}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className={styles.authorAvatarImage} />
        ) : (
          <User className={styles.authorAvatarIcon} />
        )}
      </span>

      <span className={styles.authorText}>
        <span className={styles.authorName}>{name}</span>
      </span>
    </>
  );

  if (!clickable) {
    return (
      <div className={cn(styles.authorBlock, styles.authorBlockNonClickable)}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={name ? `/author-article?author=${encodeURIComponent(name)}` : "/author-article"}
      className={styles.authorBlock}
    >
      {content}
    </Link>
  );
};

export default AuthorBlock;
