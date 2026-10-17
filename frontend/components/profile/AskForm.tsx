"use client";

import { Ban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { BD_DISTRICTS } from "@/data/bdDistricts";

import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { useSettings } from "@/hooks/use-settings";
import area from "./profile-area.module.css";
import parts from "./profile-parts.module.css";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const AskForm: React.FC = () => {
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useLocale();
  const { user } = useAuthContext();
  const [answerType, setAnswerType] = React.useState<"public" | "private">("public");
  const [district, setDistrict] = React.useState<string>("");

  React.useEffect(() => {
    const savedDistrict = localStorage.getItem("user-district");
    if (savedDistrict) {
      setDistrict(savedDistrict);
    }
  }, []);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDistrict(val);
    localStorage.setItem("user-district", val);
  };
  const { settings, isLoading: settingsLoading } = useSettings();
  const forceDisabled = Boolean(!settingsLoading && settings && !settings.isQuestionsEnabled);

  const [question, setQuestion] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("অনুগ্রহ করে আপনার প্রশ্নটি লিখুন।");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
      const res = await fetch(`${API_BASE}/api/faq/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // If we had the user's name from context we could use it, otherwise default.
          // Because AskForm is authenticated, it should be possible to grab the user, but for now fallback.
          author: user?.name || "ব্যবহারকারী", 
          district,
          question,
          isPrivate: answerType === "private",
          phone: user?.phone,
        })
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      
      router.push("/ask/success");
    } catch (err) {
      alert("দুঃখিত, প্রশ্নটি জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={area.content}>
      <h1 className={area.pageTitle}>{t("profile.ask.title")}</h1>

      <div className={parts.panelCard}>
        {forceDisabled && (
          <div className={parts.disabledOverlay}>
            <div className={parts.disabledBox}>
              <div className={parts.disabledIconWrap}>
                <Ban />
              </div>
              <h2 className={parts.disabledTitle}>প্রশ্ন জমা দেওয়া সাময়িকভাবে বন্ধ রয়েছে</h2>
              <p className={parts.disabledSubtitle}>শীঘ্রই আবার চালু হবে — ইনশাআল্লাহ।</p>
              <div className={parts.disabledDivider} />
              <p className={parts.disabledFooter}>
                আগের প্রশ্নগুলো দেখতে{" "}
                <Link href="/question-answer" className={parts.disabledLink}>
                  প্রশ্ন বিভাগ
                </Link>{" "}
                ভিজিট করুন।
              </p>
            </div>
          </div>
        )}

        <div className={forceDisabled ? parts.unselectableForm : undefined}>
          <div className={parts.tipsBox}>
            <h2 className={parts.tipsTitle}>{t("profile.ask.tipsTitle")}</h2>
            <ul className={parts.tipsList}>
              <li>{t("profile.ask.tip1")}</li>
              <li>{t("profile.ask.tip2")}</li>
            </ul>
          </div>

          <div className={parts.field}>
            <label className={parts.fieldLabel} htmlFor="ask-district">
              {t("profile.ask.districtLabel")}
            </label>
            <select
              id="ask-district"
              className={parts.select}
              value={district}
              onChange={handleDistrictChange}
              disabled={forceDisabled}
            >
              <option value="" disabled>
                {t("profile.ask.districtPlaceholder")}
              </option>
              {BD_DISTRICTS.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name[locale]}
                </option>
              ))}
            </select>
            <p className={parts.hint}>{t("profile.ask.districtHint")}</p>
          </div>

          <div className={parts.field}>
            <label className={parts.fieldLabel}>{t("profile.ask.questionLabel")}</label>
            <RichTextEditor
              placeholder={t("profile.ask.questionPlaceholder")}
              value={question}
              onChange={(val) => setQuestion(val)}
              disabled={forceDisabled || isSubmitting}
            />
          </div>

          <div className={parts.answerTypeBox}>
            <h3 className={parts.answerTypeTitle}>{t("profile.ask.answerTypeTitle")}</h3>
            <label className={parts.radioRow}>
              <input
                type="radio"
                name="answer-type"
                checked={answerType === "public"}
                onChange={() => setAnswerType("public")}
                disabled={forceDisabled}
              />
              {t("profile.ask.public")}
            </label>
            <label className={parts.radioRow}>
              <input
                type="radio"
                name="answer-type"
                checked={answerType === "private"}
                onChange={() => setAnswerType("private")}
                disabled={forceDisabled}
              />
              {t("profile.ask.private")}
            </label>
          </div>

          <label className={parts.termsRow}>
            <input type="checkbox" disabled={forceDisabled} />
            {t("profile.ask.terms")}
          </label>

          <button
            type="button"
            className={parts.submitBtn}
            disabled={forceDisabled || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "জমা দেওয়া হচ্ছে..." : t("profile.ask.submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskForm;
