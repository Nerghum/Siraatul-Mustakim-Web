"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type React from "react";
import bkashLogo from "@/assets/payment/bkash.png";
import cardMobileLogos from "@/assets/payment/card-mobile-logos.png";
import { cn } from "@/lib/utils";
import styles from "@/styles/donate.module.css";

export type PaymentMethodValue = "card" | "bkash" | "sslcommerz";

type PaymentMethodProps = {
  value: PaymentMethodValue;
  onChange: (value: PaymentMethodValue) => void;
  label: string;
  required?: boolean;
  error?: string;
};

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  value,
  onChange,
  label,
  required,
  error,
}) => {
  return (
    <div className={styles.paymentField}>
      <span className={styles.fieldLabel}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
      </span>

      <div className={styles.paymentOptions}>
        <button
          type="button"
          role="radio"
          aria-checked={value === "sslcommerz"}
          onClick={() => onChange("sslcommerz")}
          className={cn(styles.paymentRow, value === "sslcommerz" && styles.paymentRowActive)}
        >
          <span className={styles.paymentLogos}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/payment/sslcommerz.png"
              alt="SSLCommerz"
              className={styles.paymentCardLogo}
            />
          </span>
          {value === "sslcommerz" ? (
            <span className={styles.paymentCheck}>
              <Check className={styles.paymentCheckIcon} />
            </span>
          ) : null}
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={value === "card"}
          onClick={() => onChange("card")}
          className={cn(styles.paymentRow, value === "card" && styles.paymentRowActive)}
        >
          <span className={styles.paymentLogos}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardMobileLogos.src}
              alt="Visa, Mastercard, Mobile Banking"
              className={styles.paymentCardLogo}
            />
          </span>
          {value === "card" ? (
            <span className={styles.paymentCheck}>
              <Check className={styles.paymentCheckIcon} />
            </span>
          ) : null}
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={value === "bkash"}
          onClick={() => onChange("bkash")}
          className={cn(styles.paymentRow, value === "bkash" && styles.paymentRowActive)}
        >
          <span className={styles.paymentLogos}>
            <Image
              src={bkashLogo}
              alt="bKash"
              className={styles.paymentBkashLogo}
              width={80}
              height={32}
            />
          </span>
          {value === "bkash" ? (
            <span className={styles.paymentCheck}>
              <Check className={styles.paymentCheckIcon} />
            </span>
          ) : null}
        </button>
      </div>

      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
};

export default PaymentMethod;
