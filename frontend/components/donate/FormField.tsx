"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import styles from "@/styles/donate.module.css";

type FormFieldProps = {
  id: string;
  label: string;
  /** Rendered muted after the label, e.g. "(ঐচ্ছিক)". */
  optionalLabel?: string;
  /** Show red asterisk after label. */
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /** Resolved error message, or undefined when the field is valid. */
  error?: string;
};

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  optionalLabel,
  required,
  type = "text",
  inputMode,
  placeholder,
  value,
  onChange,
  error,
}) => {
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
        {optionalLabel ? <span className={styles.fieldOptional}> {optionalLabel}</span> : null}
      </label>

      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className={cn(styles.input, error && styles.inputError)}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {error ? (
        <p id={errorId} className={styles.errorText}>
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
