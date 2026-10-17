"use client";

import React from "react";
import { useTranslations } from "@/hooks/use-translations";
import area from "./profile-area.module.css";
import parts from "./profile-parts.module.css";
import QaAdCard from "./QaAdCard";

import { useAuth } from "@/hooks/use-auth";

/** /profile — edit name/email. Values are read-only for now until user update API is ready. */
const ProfileForm: React.FC = () => {
  const t = useTranslations();
  const { user } = useAuth();
  
  const [name, setName] = React.useState(user?.name || "");
  const email = user?.email || "";
  const phone = user?.phone || "";

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  return (
    <div className={area.content}>
      <h1 className={area.pageTitle}>{t("profile.edit.title")}</h1>

      <div className={parts.formCard}>
        <h2 className={parts.formHeading}>{t("profile.edit.heading")}</h2>

        <div className={parts.field}>
          <label className={parts.fieldLabel} htmlFor="profile-name">
            {t("profile.edit.fullName")}
          </label>
          <input
            id="profile-name"
            type="text"
            className={parts.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={parts.field}>
          <label className={parts.fieldLabel} htmlFor="profile-email">
            {t("profile.edit.email")}
          </label>
          <input
            id="profile-email"
            type="email"
            className={parts.input}
            value={email}
            disabled
          />
        </div>

        <div className={parts.field}>
          <label className={parts.fieldLabel} htmlFor="profile-phone">
            Phone
          </label>
          <input
            id="profile-phone"
            type="text"
            className={parts.input}
            value={phone}
            disabled
          />
        </div>

        <button type="button" className={parts.submitDisabled} disabled>
          {t("profile.edit.update")}
        </button>
      </div>

      <QaAdCard />
    </div>
  );
};

export default ProfileForm;
