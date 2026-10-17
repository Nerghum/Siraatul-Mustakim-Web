"use client";

import type React from "react";
import styles from "@/styles/detail.module.css";
import type { ContentBlockItem } from "@/types/detail";

const BLOCK_CLASS: Record<ContentBlockItem["type"], string> = {
  bismillah: styles.blockBismillah,
  paragraph: styles.blockParagraph,
  arabic: styles.blockArabic,
  translation: styles.blockTranslation,
  quote: styles.blockQuote,
  reference: styles.blockReference,
  html: styles.blockHtml,
};

const ContentBlock: React.FC<{ block: ContentBlockItem }> = ({ block }) => {
  if (block.type === "arabic") {
    // Arabic keeps its own direction and language so the naskh face and RTL
    // shaping apply regardless of the surrounding Bengali text.
    return (
      <p className={BLOCK_CLASS.arabic} lang="ar" dir="rtl">
        {block.text}
      </p>
    );
  }

  if (block.type === "html") {
    return (
      <div 
        className={`${styles.blockHtml} rte-content`}
        dangerouslySetInnerHTML={{ __html: block.text }} 
      />
    );
  }

  return <p className={BLOCK_CLASS[block.type]}>{block.text}</p>;
};

export default ContentBlock;
