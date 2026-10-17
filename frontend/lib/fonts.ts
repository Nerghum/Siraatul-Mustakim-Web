import { Amiri, Poppins } from "next/font/google";
import localFont from "next/font/local";

export const bornomala = localFont({
  src: [
    {
      path: "./fonts/Bornomala-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Bornomala-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-bornomala",
});

export const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

/** Naskh face for Qur'an/hadith blocks — only the `.arabic` rule reads it. */
export const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-arabic",
});
