"use client";

import Image from "next/image";
import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";

const BankDetails: React.FC = () => {
  const t = useTranslations();

  const rows = [
    { label: t("donate.bank.name"), value: "Islami Bank Bangladesh PLC" },
    { label: t("donate.bank.accountName"), value: "Siraatul Mustaqim" },
    { label: t("donate.bank.branch"), value: "Dhaka, Bangladesh" },
    { label: t("donate.bank.accountNumber"), value: "12345678" },
    { label: t("donate.bank.routingNumber"), value: "125260341" },
    { label: t("donate.bank.swiftCode"), value: "IBBLBDDH" },
  ];

  return (
    <div className={styles.bankCard}>
      <div className={styles.bankLogo}>
        <Image
          src="/payment/ibbl.svg"
          alt="Islami Bank Bangladesh PLC"
          width={80}
          height={80}
          className={styles.bankLogoImg}
        />
      </div>
      <div className={styles.bankRows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.bankRow}>
            <span className={styles.bankLabel}>{row.label}:</span>
            <span className={styles.bankValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankDetails;
