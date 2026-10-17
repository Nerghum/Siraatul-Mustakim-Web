"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "@/styles/video-modal.css";

type VideoModalProps = {
  youtubeId: string;
  onClose: () => void;
};

const VideoModal = ({ youtubeId, onClose }: VideoModalProps) => {
  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.classList.add("lightbox-open");
    document.body.style.top = `-${scrollY}px`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("lightbox-open");
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="video-modal-overlay" onClick={onClose}>
      <button onClick={onClose} className="video-modal-close-btn" aria-label="Close video">
        <X size={28} />
      </button>
      <div onClick={(e) => e.stopPropagation()} className="video-modal-iframe-wrap">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="video-modal-iframe"
        />
      </div>
    </div>,
    document.body,
  );
};

export default VideoModal;
