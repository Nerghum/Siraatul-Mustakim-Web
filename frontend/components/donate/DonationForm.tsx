"use client";

import { AlertCircle, CircleCheck, Heart, Info, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import type { DonationFund } from "@/data/mockDonate";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toEnglishDigits, toLocalizedNumber } from "@/lib/banglaFormat";
import {
  type DonationErrors,
  type DonationFrequency,
  type DonationType,
  validateDonation,
} from "@/lib/donation";
import { initiateDonationPayment } from "@/lib/api/payment";
import { cn } from "@/lib/utils";
import styles from "@/styles/donate.module.css";
import AmountGrid from "./AmountGrid";
import FormField from "./FormField";
import PaymentMethod, { type PaymentMethodValue } from "./PaymentMethod";
import RecurringConfirmDrawer from "./RecurringConfirmDrawer";
import SegmentedControl from "./SegmentedControl";

type DonationFormProps = {
  fund: DonationFund;
  updateParam: (key: string, value: string) => void;
};

const DonationForm: React.FC<DonationFormProps> = ({ fund, updateParam }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const searchParams = useSearchParams();

  const defaultAmount = String(
    fund.presetAmounts[fund.defaultAmountIndex] ?? fund.presetAmounts[0],
  );

  const amountParam = searchParams.get("amount") ?? "";
  const initialIsCustom =
    amountParam === "custom" ||
    (amountParam !== "" && !fund.presetAmounts.includes(Number(amountParam)));

  // Immediate local states for instant UI feedback
  const [selectedAmount, setSelectedAmount] = React.useState(amountParam || defaultAmount);
  const [isCustom, setIsCustom] = React.useState(initialIsCustom);
  const [customInput, setCustomInput] = React.useState(
    initialIsCustom && amountParam !== "custom" ? amountParam : "",
  );

  const [frequency, setFrequency] = React.useState<DonationFrequency>(
    searchParams.get("type") === "monthly" ? "monthly" : "oneTime",
  );
  const [donationType, setDonationType] = React.useState<DonationType>(
    searchParams.get("category") === "zakat" ? "zakat" : "general",
  );

  // Form fields
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodValue>("card");

  const [errors, setErrors] = React.useState<DonationErrors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const amountRef = React.useRef<HTMLInputElement>(null);

  // Sync state if fund slug changes
  const [lastFund, setLastFund] = React.useState(fund.slug);
  if (lastFund !== fund.slug) {
    setLastFund(fund.slug);
    setSelectedAmount(defaultAmount);
    setIsCustom(false);
    setCustomInput("");
  }

  // Sync state when URL params change externally (e.g. back/forward navigation)
  React.useEffect(() => {
    const urlType = searchParams.get("type");
    if (urlType === "monthly" || urlType === "oneTime") {
      setFrequency(urlType);
    }
    const urlCat = searchParams.get("category");
    if (urlCat === "zakat" || urlCat === "general") {
      setDonationType(urlCat);
    }
    const urlAmount = searchParams.get("amount");
    if (urlAmount !== null) {
      if (urlAmount === "custom") {
        setIsCustom(true);
        setSelectedAmount("custom");
      } else if (urlAmount !== "" && !fund.presetAmounts.includes(Number(urlAmount))) {
        setIsCustom(true);
        setCustomInput(urlAmount);
        setSelectedAmount(urlAmount);
      } else if (urlAmount !== "") {
        setIsCustom(false);
        setCustomInput("");
        setSelectedAmount(urlAmount);
      }
    }
  }, [searchParams, fund.presetAmounts]);

  const inputDisplayValue = isCustom ? customInput : toLocalizedNumber(selectedAmount, locale);

  const handleSelectAmount = (next: string) => {
    setIsCustom(false);
    setCustomInput("");
    setSelectedAmount(next);
    updateParam("amount", next);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    setCustomInput("");
    setSelectedAmount("custom");
    updateParam("amount", "custom");
    requestAnimationFrame(() => amountRef.current?.focus());
  };

  const handleFrequencyChange = (v: DonationFrequency) => {
    setFrequency(v);
    updateParam("type", v);
  };

  const handleDonationTypeChange = (v: DonationType) => {
    setDonationType(v);
    updateParam("category", v);
  };

  const values = {
    amount: toEnglishDigits(isCustom ? customInput : selectedAmount),
    frequency,
    type: donationType,
    name,
    mobile,
    email,
    paymentMethod,
  };

  const executePayment = async () => {
    setIsSubmitting(true);
    setApiError(null);

    const cleanAmount = toEnglishDigits(isCustom ? customInput : selectedAmount);

    try {
      const res = await initiateDonationPayment({
        amount: cleanAmount,
        cus_phone: mobile,
        cus_name: name || undefined,
        cus_email: email || undefined,
        category: donationType,
        fund: fund.slug,
        frequency,
        paymentMethod,
      });

      if (res.status && res.data?.redirectURL) {
        // Redirect directly to the secure gateway URL (bKash or SSLCommerz)
        window.location.href = res.data.redirectURL;
        return;
      }

      if (!res.status) {
        setApiError(
          res.message || "পেমেন্ট গেটওয়েতে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
        );
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setIsSubmitting(false);
    } catch (err: any) {
      setApiError(
        err.message || "পেমেন্ট গেটওয়েতে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
      );
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(null);
    const nextErrors = validateDonation(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      if (frequency === "monthly") {
        setIsConfirmOpen(true);
      } else {
        executePayment();
      }
    }
  };

  const handleConfirmRecurring = () => {
    setIsConfirmOpen(false);
    executePayment();
  };

  const resetForm = () => {
    setSubmitted(false);
    setErrors({});
    setName("");
    setMobile("");
    setEmail("");
    setPaymentMethod("card");
    setCustomInput("");
    setIsCustom(false);
    setSelectedAmount(defaultAmount);
  };

  const errorText = (field: keyof DonationErrors) =>
    errors[field] ? t(`donate.errors.${errors[field]}`) : undefined;

  if (submitted) {
    return (
      <div className={styles.card}>
        <div className={styles.success} role="status">
          <span className={styles.successBadge}>
            <CircleCheck className={styles.successIcon} />
          </span>
          <h2 className={styles.successTitle}>{t("donate.success.title")}</h2>
          <p className={styles.successText}>{t("donate.success.text")}</p>
          <button type="button" className={styles.successAgain} onClick={resetForm}>
            {t("donate.success.again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <div className={styles.panel}>
        <div className={styles.panelDesktop}>
          <p className={styles.panelHeading}>{t("donate.panel.heading")}</p>
          <p className={styles.panelText}>{t("donate.panel.text")}</p>
        </div>

        <div className={styles.panelMobile}>
          <p className={styles.panelHeading}>
            {t("donate.titleBefore")}
            {t("donate.titleHighlight")}
            {t("donate.titleAfter")}
          </p>
          <p className={styles.panelText}>{t("donate.subtitle")}</p>
        </div>
      </div>

      <div className={styles.formBody}>
        <SegmentedControl
          ariaLabel={t("donate.frequency.oneTime")}
          value={frequency}
          onChange={handleFrequencyChange}
          options={[
            { value: "oneTime", label: t("donate.frequency.oneTime") },
            { value: "monthly", label: t("donate.frequency.monthly") },
          ]}
        />

        <AmountGrid
          amounts={fund.presetAmounts}
          value={selectedAmount}
          custom={isCustom}
          onSelect={handleSelectAmount}
          onSelectCustom={handleSelectCustom}
        />

        {/* Amount input */}
        <div className={styles.inlineRow}>
          <label htmlFor="donate-amount" className={styles.inlineLabel}>
            {t("donate.amount.label")}
          </label>
          <div className={styles.inlineField}>
            <input
              id="donate-amount"
              ref={amountRef}
              type="text"
              inputMode="numeric"
              disabled={!isCustom}
              className={cn(
                styles.input,
                styles.inputAmount,
                !isCustom && styles.inputLocked,
                errors.amount && styles.inputError,
              )}
              placeholder={t("donate.amount.placeholder")}
              value={inputDisplayValue}
              onChange={(event) => {
                const val = event.target.value;
                setCustomInput(val);
                setSelectedAmount(toEnglishDigits(val));
              }}
              onBlur={() => {
                if (isCustom) updateParam("amount", customInput || "custom");
              }}
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={errors.amount ? "donate-amount-error" : undefined}
            />
          </div>
        </div>
        {errors.amount ? (
          <p id="donate-amount-error" className={styles.errorText}>
            {errorText("amount")}
          </p>
        ) : null}

        {/* Donation type */}
        <div className={styles.inlineRow}>
          <span className={styles.inlineLabel}>{t("donate.type.label")}</span>
          <div className={styles.inlineField}>
            <SegmentedControl
              inline
              variant="primary"
              ariaLabel={t("donate.type.label")}
              value={donationType}
              onChange={handleDonationTypeChange}
              options={[
                { value: "general", label: t("donate.type.general") },
                { value: "zakat", label: t("donate.type.zakat") },
              ]}
            />
          </div>
        </div>

        {/* Name */}
        <FormField
          id="donate-name"
          label={t("donate.fields.name")}
          placeholder={t("donate.fields.namePlaceholder")}
          value={name}
          onChange={setName}
          error={errorText("name")}
        />

        {/* Mobile (Required) */}
        <FormField
          id="donate-mobile"
          label={t("donate.fields.mobile")}
          placeholder={t("donate.fields.mobilePlaceholder")}
          value={mobile}
          onChange={setMobile}
          type="tel"
          inputMode="tel"
          required
          error={errorText("mobile")}
        />

        {/* Email (Optional) */}
        <FormField
          id="donate-email"
          label={t("donate.fields.email")}
          placeholder={t("donate.fields.emailPlaceholder")}
          value={email}
          onChange={setEmail}
          type="email"
          inputMode="email"
          error={errorText("email")}
        />

        {/* Payment method */}
        <PaymentMethod
          value={paymentMethod}
          onChange={setPaymentMethod}
          label={t("donate.payment.label")}
          required
          error={errorText("paymentMethod")}
        />

        {apiError ? (
          <div className="p-3.5 my-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">{apiError}</div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(styles.submit, isSubmitting && "opacity-80 cursor-wait")}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin inline-block mr-2 text-white" />
              পেমেন্ট গেটওয়েতে সংযোগ হচ্ছে...
            </>
          ) : (
            <>
              <Heart className={styles.submitIcon} fill="currentColor" />
              {frequency === "monthly" ? "পরবর্তী" : t("donate.submit")}
            </>
          )}
        </button>

        <p className={styles.terms}>
          {t("donate.terms.text")}{" "}
          <a href="/terms" className={styles.termsLink}>
            {t("donate.terms.link")}
          </a>
        </p>
      </div>

      <RecurringConfirmDrawer
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRecurring}
        amount={toEnglishDigits(isCustom ? customInput : selectedAmount)}
        paymentMethod={paymentMethod}
      />
    </form>
  );
};

export default DonationForm;
