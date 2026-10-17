"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import kitab from "@/assets/kitab.jpg";
import { kitabFileUrl } from "@/lib/api/kitab";
import type { BookItem } from "@/data/mockBooks";
import styles from "@/styles/books.module.css";

type BookCardProps = {
  item: BookItem;
  /** Link prefix — "/books" yields /books/3. */
  basePath: string;
};

/**
 * A single book tile: cover + title + author.
 * Uses the real cover image from the API when available; falls back to the
 * local `assets/kitab.jpg` placeholder.
 */
const BookCard: React.FC<BookCardProps> = ({ item, basePath }) => {
  const coverSrc = item.coverImage ? kitabFileUrl(item.coverImage) : null;

  return (
    <Link href={`${basePath}/${item.id}`} className={styles.bookCard}>
      <div className={styles.bookCover}>
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 45vw, 30vw"
            unoptimized
          />
        ) : (
          <Image src={kitab} alt={item.title} fill sizes="(max-width: 1024px) 45vw, 30vw" />
        )}
      </div>
      <h3 className={styles.bookTitle}>{item.title}</h3>
      <p className={styles.bookAuthor}>{item.author}</p>
    </Link>
  );
};

export default BookCard;
