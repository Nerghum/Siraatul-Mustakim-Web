"use client";

import {
  Bold,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import React from "react";
import styles from "./profile-parts.module.css";

type ToolButton =
  | { type: "divider" }
  | { type: "cmd"; icon: React.ReactNode; command: string; value?: string; label: string }
  | { type: "link"; icon: React.ReactNode; label: string };

const TOOLBAR: ToolButton[] = [
  { type: "cmd", command: "bold", icon: <Bold size={16} />, label: "Bold" },
  { type: "cmd", command: "italic", icon: <Italic size={16} />, label: "Italic" },
  { type: "cmd", command: "underline", icon: <Underline size={16} />, label: "Underline" },
  {
    type: "cmd",
    command: "strikeThrough",
    icon: <Strikethrough size={16} />,
    label: "Strikethrough",
  },
  { type: "divider" },
  {
    type: "cmd",
    command: "formatBlock",
    value: "h2",
    icon: <Heading2 size={16} />,
    label: "Heading",
  },
  { type: "cmd", command: "insertUnorderedList", icon: <List size={16} />, label: "Bulleted list" },
  {
    type: "cmd",
    command: "insertOrderedList",
    icon: <ListOrdered size={16} />,
    label: "Numbered list",
  },
  {
    type: "cmd",
    command: "formatBlock",
    value: "blockquote",
    icon: <Quote size={16} />,
    label: "Quote",
  },
  { type: "divider" },
  { type: "link", icon: <LinkIcon size={16} />, label: "Link" },
];

/**
 * Dependency-free rich-text editor: a contentEditable surface with a formatting
 * toolbar (execCommand). Used by the author compose/answer forms. The editor is
 * uncontrolled — a real backend/serialization lands with the API.
 */
const RichTextEditor: React.FC<{ placeholder: string }> = ({ placeholder }) => {
  const areaRef = React.useRef<HTMLDivElement>(null);

  const exec = (command: string, value?: string) => {
    areaRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const insertLink = () => {
    const url = window.prompt("URL");
    if (url) exec("createLink", url);
  };

  return (
    <div className={styles.rteWrap}>
      <div className={styles.rteToolbar} role="toolbar">
        {TOOLBAR.map((btn, i) =>
          btn.type === "divider" ? (
            <span key={`d-${i}`} className={styles.rteDivider} aria-hidden="true" />
          ) : (
            <button
              key={btn.label}
              type="button"
              className={styles.rteBtn}
              title={btn.label}
              aria-label={btn.label}
              // Keep the editor selection while clicking a toolbar button.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => (btn.type === "link" ? insertLink() : exec(btn.command, btn.value))}
            >
              {btn.icon}
            </button>
          ),
        )}
      </div>

      <div
        ref={areaRef}
        className={styles.rteArea}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
