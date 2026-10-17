"use client";

import { User } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/detail.module.css";

type AuthorBlockProps = {
  name: string;
  avatar?: string;
};

const AuthorBlock: React.FC<AuthorBlockProps> = ({ name, avatar }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <Link href="/author-article" className={styles.authorBlock}>
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
    </Link>
  );
};

export default AuthorBlock;
