"use client";

import {
  BarChart3,
  BookOpen,
  Database,
  GraduationCap,
  Home,
  Landmark,
  type LucideIcon,
  Users,
  UsersRound,
} from "lucide-react";
import type React from "react";
import type { FeatureId } from "@/data/mockDonate";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";

const FEATURE_ICON: Record<FeatureId, LucideIcon> = {
  masjid: Home,
  research: Database,
  dataCenter: Landmark,
  maktab: GraduationCap,
  hifz: BookOpen,
  education: Users,
  adult: UsersRound,
  training: BarChart3,
};

const FeatureGrid: React.FC<{ features: FeatureId[] }> = ({ features }) => {
  const t = useTranslations();

  return (
    <section className={styles.card}>
      <h2 className={styles.featuresHeading}>{t("donate.features.heading")}</h2>

      <div className={styles.featureGrid}>
        {features.map((feature) => {
          const Icon = FEATURE_ICON[feature];
          return (
            <div key={feature} className={styles.featureTile}>
              <span className={styles.featureIcon}>
                <Icon className={styles.featureIconGlyph} />
              </span>
              <span className={styles.featureLabel}>{t(`donate.features.${feature}`)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureGrid;
