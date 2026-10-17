"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { getHomeCategories } from "@/data/mockCategories";
import { useAsyncData } from "@/hooks/use-async-data";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/categories.module.css";
import CategoryGridSkeleton from "./CategoryGridSkeleton";

const Categories = () => {
  const t = useTranslations();
  const createRipple = useRipple();

  // Fetch the tiles from the (mock) endpoint; drives the grid's skeleton.
  const { data, loading } = useAsyncData(() => getHomeCategories(), []);
  const categories = data ?? [];

  return (
    <section className={styles.section}>
      <Wrapper>
        <ScrollRevealWrapper className={styles.container}>
          <ScrollRevealItem className={styles.grid}>
            {loading ? (
              <CategoryGridSkeleton />
            ) : (
              categories.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={styles.card}
                  title={t(`home.categories.${item.translationKey}`)}
                  onClick={(e) => createRipple(e)}
                >
                  <div className={styles.iconWrapper}>
                    <Image
                      src={item.image}
                      alt={item.name || t(`home.categories.${item.translationKey}`)}
                      width={40}
                      height={40}
                      className={styles.icon}
                    />
                  </div>
                  <h3 className={styles.title} title={item.name || t(`home.categories.${item.translationKey}`)}>
                    {/* If translationKey is mapped in locale, use translation, else fallback to db name */}
                    {t(`home.categories.${item.translationKey}`) !== `home.categories.${item.translationKey}`
                      ? t(`home.categories.${item.translationKey}`)
                      : item.name}
                  </h3>
                </Link>
              ))
            )}
          </ScrollRevealItem>
        </ScrollRevealWrapper>
      </Wrapper>
    </section>
  );
};

export default Categories;
