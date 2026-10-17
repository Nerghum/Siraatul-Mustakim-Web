"use client";

import {
  Bookmark,
  ChevronRight,
  FileText,
  HelpCircle,
  ListChecks,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useTranslations } from "@/hooks/use-translations";

type UserDropdownProps = {
  user: { name?: string; email?: string; role?: string } | null;
  onClose: () => void;
  onLogout: () => void;
};



import { getRailItems } from "../profile/ProfileSidebar";

const ICONS_MAP: Record<string, any> = {
  "/my-questions": HelpCircle,
  "/ask-2": MessageSquare,
  "/answer-queue": ListChecks,
  "/profile": User,
  "/bookmarks": Bookmark,
  "/my-articles": FileText,
  "/my-masail": MessageSquare,
};

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onClose, onLogout }) => {
  const t = useTranslations();
  
  const items = getRailItems(user?.role || "user").map(item => ({
    ...item,
    icon: ICONS_MAP[item.href] || User
  }));

  return (
    <div className="user-dropdown">
      <div className="user-dropdown-header">
        <span className="user-dropdown-avatar">{(user?.name?.[0] ?? "U").toUpperCase()}</span>
        <span className="user-dropdown-name">{user?.name ?? "User"}</span>
      </div>
      <div className="user-dropdown-divider" />
      <nav className="user-dropdown-nav">
        {items.map(({ href, icon: Icon, labelKey }) => (
          <Link key={href} href={href} className="user-dropdown-item" onClick={onClose}>
            <Icon size={18} className="user-dropdown-item-icon" />
            <span className="user-dropdown-item-label">{t(labelKey)}</span>
            <ChevronRight size={16} className="user-dropdown-item-chevron" />
          </Link>
        ))}
      </nav>
      <div className="user-dropdown-divider" />
      <button
        type="button"
        className="user-dropdown-item user-dropdown-logout"
        onClick={() => {
          onLogout();
          onClose();
        }}
      >
        <LogOut size={18} className="user-dropdown-item-icon" />
        <span className="user-dropdown-item-label">{t("header.userDropdown.logout")}</span>
      </button>
    </div>
  );
};

export default UserDropdown;
