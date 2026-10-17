"use client";

import { Plus } from "lucide-react";
import React from "react";
import { useRawTranslations, useTranslations } from "@/hooks/use-translations";
import CategoryPickerSheet from "./CategoryPickerSheet";
import styles from "./profile-parts.module.css";
import RichTextEditor from "../ui/rich-text-editor";

type Props = {
  /** Editor field label — e.g. "উত্তর লিখুন" or "প্রবন্ধ লিখুন". */
  editorLabel: string;
  editorPlaceholder: string;
  /** Publish button label — e.g. "উত্তরটি পাবলিশ করুন". */
  publishLabel: string;
  onSubmit: (data: { title: string; content: string; status: "draft" | "published"; tags: string[] }) => void;
  isSubmitting?: boolean;
  initialData?: { title: string; content: string; tags: string[] };
};

/**
 * Shared authoring form for the author pages (answer panel + article/masail
 * compose): category checkboxes with a "+" that opens the category picker
 * drawer, a title field, a rich-text editor, and publish/draft buttons.
 */
const ComposeForm: React.FC<Props> = ({ editorLabel, editorPlaceholder, publishLabel, onSubmit, isSubmitting, initialData }) => {
  const t = useTranslations();
  const raw = useRawTranslations();
  const baseCategories = (raw("profile.compose.categories") as string[]) ?? [];

  const [selected, setSelected] = React.useState<string[]>([]);
  const [customCategories, setCustomCategories] = React.useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setSelected(initialData.tags || []);
    }
  }, [initialData]);

  const toggle = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  // Add a brand-new category from the picker: remember it and select it.
  const addCategory = (label: string) => {
    setCustomCategories((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setSelected((prev) => (prev.includes(label) ? prev : [...prev, label]));
  };

  // Base quick-pick checkboxes plus any extra categories chosen from the drawer.
  const extra = selected.filter((label) => !baseCategories.includes(label));
  const inlineCategories = [...baseCategories, ...extra];

  return (
    <div>
      <div className={styles.catRow}>
        <span className={styles.catLabel}>{t("profile.compose.categoryLabel")}</span>
        <button
          type="button"
          className={styles.catAdd}
          aria-label={t("profile.compose.categorySheetTitle")}
          onClick={() => setPickerOpen(true)}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className={styles.catList}>
        {inlineCategories.map((label) => (
          <label key={label} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={selected.includes(label)}
              onChange={() => toggle(label)}
            />
            {label}
          </label>
        ))}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="compose-title">
          {t("profile.compose.titleLabel")}
        </label>
        <input
          id="compose-title"
          type="text"
          className={styles.input}
          placeholder={t("profile.compose.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className={styles.hint}>{t("profile.compose.titleHint")}</p>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>{editorLabel}</label>
        <RichTextEditor placeholder={editorPlaceholder} value={content} onChange={setContent} />
      </div>

      <div className={styles.actions}>
        <button 
          type="button" 
          className={styles.publishBtn} 
          disabled={isSubmitting}
          onClick={() => onSubmit({ title, content, status: "published", tags: selected })}
        >
          {isSubmitting ? "..." : publishLabel}
        </button>
        <button 
          type="button" 
          className={styles.draftBtn}
          disabled={isSubmitting}
          onClick={() => onSubmit({ title, content, status: "draft", tags: selected })}
        >
          {t("profile.compose.saveDraft")}
        </button>
      </div>

      <CategoryPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={selected}
        extraOptions={customCategories}
        onToggle={toggle}
        onAdd={addCategory}
      />
    </div>
  );
};

export default ComposeForm;
