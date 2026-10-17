"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import Image from "next/image";
import bkashLogo from "@/assets/payment/bkash.png";
import styles from "./recurring-confirm-drawer.module.css";

interface RecurringConfirmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number | string;
  paymentMethod: "card" | "bkash" | "sslcommerz";
  fundTitle?: string;
}

export default function RecurringConfirmDrawer({
  isOpen,
  onClose,
  onConfirm,
  amount,
  paymentMethod,
}: RecurringConfirmDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock html & body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Convert English number to Bengali digits
  const toBn = (num: number | string) => {
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
  };

  // Format dates in Bengali: e.g. "২৫ সেপ্ট ২০২৬"
  const monthNamesBn = [
    "জানু",
    "ফেব্রু",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্ট",
    "অক্টো",
    "নভে",
    "ডিসে",
  ];

  const today = new Date();
  const startDateStr = `${toBn(today.getDate())} ${monthNamesBn[today.getMonth()]} ${toBn(today.getFullYear())}`;

  // End date is 2 years from today
  const endDate = new Date(today);
  endDate.setFullYear(today.getFullYear() + 2);
  endDate.setDate(today.getDate() - 1);
  const endDateStr = `${toBn(endDate.getDate())} ${monthNamesBn[endDate.getMonth()]} ${toBn(endDate.getFullYear())}`;

  const formattedAmount = toBn(Number(amount).toLocaleString("en-US"));

  const getGatewayLabel = () => {
    if (paymentMethod === "bkash") return "বিকাশ";
    if (paymentMethod === "card") return "কার্ড / মোবাইল ব্যাংকিং";
    return "SSLCommerz";
  };

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.drawer}>
        {/* Floating Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="বন্ধ করুন"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className={styles.content}>
          {/* Green Header Banner */}
          <div className={styles.headerCard}>
            <h3 className={styles.headerTitle}>
              আপনার মাসিক দানের সিদ্ধান্ত নিশ্চিত করুন
            </h3>
            <p className={styles.headerSubtitle}>
              আপনি প্রতি মাসে ৳{formattedAmount} করে নিয়মিতভাবে দান করতে সম্মতি দিচ্ছেন। এই স্বয়ংক্রিয় দান শুরু হবে {startDateStr} থেকে এবং চলবে {endDateStr} পর্যন্ত, ইনশাআল্লাহ।
            </p>
          </div>

          {/* Warning Notice */}
          <div className={styles.warningBox}>
            <AlertTriangle className={styles.warningIcon} />
            <p className={styles.warningText}>
              যেকোনো সময় আপনি এই নিয়মিত দান বন্ধ করতে পারবেন।
            </p>
          </div>

          {/* Details Table Card */}
          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>অনুদানের মাধ্যম:</span>
              <span className={styles.detailValue}>
                {paymentMethod === "bkash" ? (
                  <span className={styles.gatewayBadge}>
                    <Image
                      src={bkashLogo}
                      alt="bKash"
                      width={48}
                      height={20}
                      className={styles.gatewayLogo}
                    />
                    <span>• বিকাশ</span>
                  </span>
                ) : (
                  <span>{getGatewayLabel()}</span>
                )}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>দানের পরিমাণ:</span>
              <span className={styles.detailValue}>{formattedAmount}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>শুরুর তারিখ:</span>
              <span className={styles.detailValue}>{startDateStr}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>শেষের তারিখ:</span>
              <span className={styles.detailValue}>{endDateStr}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>মোট দানের সংখ্যা:</span>
              <span className={styles.detailValue}>২৪ টি</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>পুনরাবৃত্তি:</span>
              <span className={styles.detailValueHighlight}>প্রতি ৩০ দিন</span>
            </div>
          </div>

          {/* Motivational Line */}
          <p className={styles.motivationText}>
            মাসে একটি ছোট দানও আপনার জন্য স্থায়ী সওয়াবের দরজা খুলে দিতে পারে।
          </p>

          {/* Agreement Checkbox */}
          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={styles.checkboxInput}
            />
            <span className={styles.consentLabel}>
              আমি এই নিয়মিত ও স্বয়ংক্রিয় দানের শর্তাবলিতে সম্মতি দিচ্ছি।
            </span>
          </label>

          {/* Action Buttons */}
          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={onClose}
            >
              পূর্ববর্তী ধাপ
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              disabled={!agreed}
              onClick={() => {
                if (agreed) {
                  onConfirm();
                }
              }}
            >
              দান করুন
            </button>
          </div>

          {/* Disclaimer Text */}
          <p className={styles.disclaimerText}>
            দান করুন ক্লিক করে আপনি আমাদের <a href="/terms" className={styles.disclaimerLink}>শর্তাবলী</a> এবং <a href="/privacy" className={styles.disclaimerLink}>গোপনীয়তা নীতির</a> সাথে সম্মত হন এবং অটো পে চালু করার মাধ্যমে আপনি আপনার একাউন্ট থেকে প্রদত্ত অনুদান-এর বিবরণী অনুযায়ী অনুদানের পরিমাণ অটো পে করার জন্য অনুমোদন দিচ্ছেন।
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
