"use client";

import { ArrowLeft, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/auth-modal.module.css";
import { requestOtp, verifyOtp } from "@/lib/api/auth";
import { FacebookIcon, GoogleIcon } from "./AuthIcons";
import OTPInput from "./OTPInput";

type Step = "entry" | "otp";

const AuthModal: React.FC = () => {
  const { isModalOpen, closeAuthModal, login } = useAuthContext();
  const t = useTranslations();
  const [step, setStep] = React.useState<Step>("entry");
  const [contact, setContact] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const focusableRef = React.useRef<HTMLElement[]>([]);

  const reset = React.useCallback(() => {
    setStep("entry");
    setContact("");
    setCode("");
    setError("");
    setIsLoading(false);
  }, []);

  const handleClose = React.useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      closeAuthModal();
    }, 150);
  }, [closeAuthModal]);

  const gatherFocusable = React.useCallback(() => {
    if (!panelRef.current) return [];
    return Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);

  React.useEffect(() => {
    if (isModalOpen) {
      reset();
      previousFocusRef.current = document.activeElement as HTMLElement;
      const id = window.setTimeout(() => {
        panelRef.current?.focus();
        focusableRef.current = gatherFocusable();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [isModalOpen, reset, gatherFocusable]);

  React.useEffect(() => {
    if (isModalOpen && step === "entry") {
      const id = window.setTimeout(() => inputRef.current?.focus(), 100);
      return () => window.clearTimeout(id);
    }
  }, [isModalOpen, step]);

  React.useEffect(() => {
    if (!isModalOpen) return;
    focusableRef.current = gatherFocusable();
  }, [step, isModalOpen, gatherFocusable]);

  React.useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step === "otp") {
          setStep("entry");
          setCode("");
        } else {
          handleClose();
        }
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = focusableRef.current;
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, step, handleClose]);

  React.useEffect(() => {
    if (!isModalOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isModalOpen]);

  React.useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleContinue = async () => {
    const trimmed = contact.trim();
    if (!trimmed) {
      setError(t("auth.required"));
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await requestOtp(trimmed);
      setStep("otp");
      toast.dismiss();
      toast(t("auth.codeSent"), { position: "bottom-center" });
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeComplete = async (value: string) => {
    setIsLoading(true);
    try {
      const res = await verifyOtp(contact, value);
      login(res);
      toast.dismiss();
      toast(t("auth.welcome", { name: res.user.name || "User" }), { position: "bottom-center" });
      handleClose();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = (provider: "google" | "facebook") => {
    // Currently not supported in backend, but keep UI functional for now
    login({
      user: { id: "123", name: "User", email: "social@mock.local", provider, role: "user" },
      token: "mock_token",
    });
    toast.dismiss();
    toast(t("auth.welcomeSocial", { provider }), { position: "bottom-center" });
    handleClose();
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await requestOtp(contact);
      toast.dismiss();
      toast(t("auth.newCodeSent"), { position: "bottom-center" });
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const displayContact = contact || "+880 1X-XXXXXXX";

  return (
    <div
      className={`${styles.overlay}${closing ? ` ${styles.overlayClosing}` : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("auth.title")}
        tabIndex={-1}
      >
        {step === "entry" ? (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        ) : null}

        <div className={styles.body}>
          {step === "entry" ? (
            <>
              <h1 className={styles.heading}>{t("auth.title")}</h1>

              <div className={styles.field}>
                <input
                  id="auth-contact"
                  ref={inputRef}
                  className={styles.input}
                  type="text"
                  inputMode={contact.includes("@") ? "email" : "tel"}
                  placeholder={t("auth.contactLabel")}
                  aria-label={t("auth.contactLabel")}
                  autoComplete="email"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContinue();
                  }}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}

              <p className={styles.helperText}>
                {t("auth.confirmationText")}{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  {t("auth.privacy")}
                </a>
              </p>

              <button
                type="button"
                className={styles.primaryBtn}
                disabled={isLoading}
                onClick={handleContinue}
              >
                {isLoading ? `${t("auth.verifying")}…` : t("auth.continue")}
              </button>

              <div className={styles.divider}>
                <span />
                <em>{t("auth.or")}</em>
                <span />
              </div>

              <div className={styles.socialRow}>
                <button
                  type="button"
                  className={styles.socialBtnGoogle}
                  onClick={() => handleSocial("google")}
                  aria-label={t("auth.google")}
                >
                  <GoogleIcon size={18} />
                  <span className={styles.socialBtnText}>{t("auth.google")}</span>
                </button>
                <button
                  type="button"
                  className={styles.socialBtnFacebook}
                  onClick={() => handleSocial("facebook")}
                  aria-label={t("auth.facebook")}
                >
                  <FacebookIcon size={18} color="#ffffff" />
                  <span className={styles.socialBtnText}>{t("auth.facebook")}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.otpNavRow}>
                <button
                  type="button"
                  className={styles.navIconBtn}
                  onClick={() => {
                    setStep("entry");
                    setCode("");
                  }}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  className={styles.navIconBtn}
                  onClick={handleClose}
                  aria-label={t("common.close")}
                >
                  <X size={18} />
                </button>
              </div>

              <h1 className={styles.otpHeading}>{t("auth.confirmTitle")}</h1>
              <p className={styles.otpSubtext}>
                {t("auth.codeSentTo")} <strong>{displayContact}</strong>
              </p>

              <div className={styles.otpInputWrapper}>
                <OTPInput
                  length={4}
                  value={code}
                  onChange={setCode}
                  onComplete={handleCodeComplete}
                />
              </div>

              <p className={styles.resendRow}>
                {t("auth.didntGetIt")}{" "}
                <button
                  type="button"
                  className={styles.resendLink}
                  onClick={handleResend}
                  disabled={isLoading}
                >
                  {t("auth.sendNewCode")}
                </button>
              </p>

              <div className={styles.otpFooter}>
                <button
                  type="button"
                  className={styles.tryAnotherBtn}
                  onClick={() => {
                    setStep("entry");
                    setCode("");
                  }}
                >
                  {t("auth.tryAnotherWay")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
