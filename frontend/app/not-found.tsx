"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import { useTranslations } from "@/hooks/use-translations";
import "./not-found.css";

const NotFound = () => {
  const t = useTranslations();

  return (
    <>
      <Header fullWidth />
      <section className="not-found-container">
        <div>
          <h3 className="not-found-title">{t("notFound.heading")}</h3>
          <p className="not-found-description">{t("notFound.description")}</p>
          <Image
            src="/logo-not-found.jpg"
            alt="Siraatul Mustaqim"
            width={500}
            height={300}
            className="not-found-image"
          />
        </div>
        <div className="not-found-button-wrapper">
          <Link href="/" className="not-found-button">
            {t("notFound.backToHome")}
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;
