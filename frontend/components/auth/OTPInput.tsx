"use client";

import React from "react";
import styles from "@/styles/auth-modal.module.css";

type OTPInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

const OTPInput: React.FC<OTPInputProps> = ({ length = 4, value, onChange, onComplete }) => {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const filled = value.length === length;

  const focusIndex = (index: number) => {
    refs.current[index]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "");
    if (!digit) return;
    const next = value.slice(0, index) + digit + value.slice(index + 1);
    onChange(next.slice(0, length));
    if (index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        const next = value.slice(0, index) + value.slice(index + 1);
        onChange(next);
      } else if (index > 0) {
        const next = value.slice(0, index - 1) + value.slice(index);
        onChange(next);
        focusIndex(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (digits) {
      onChange(digits);
      focusIndex(Math.min(digits.length, length - 1));
    }
  };

  React.useEffect(() => {
    if (filled && onComplete) onComplete(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    if (!filled) {
      const firstEmpty = value.split("").findIndex((_, i) => !value[i]);
      focusIndex(firstEmpty === -1 ? 0 : firstEmpty);
    }
  }, [filled]);

  return (
    <div className={styles.otpContainer} role="group" aria-label="verification code">
      {Array.from({ length }).map((_, index) => (
        <div key={index} className={styles.otpDigitCell}>
          <input
            ref={(el) => {
              refs.current[index] = el;
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            className={styles.otpDigitInput}
            maxLength={1}
            value={value[index] ?? ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`digit ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
};

export default OTPInput;
