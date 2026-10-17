import type { Metadata } from "next";
import Wrapper from "@/components/wrapper";
import styles from "@/styles/contributors.module.css";

export const metadata: Metadata = {
  title: "টার্মস অফ সার্ভিস - সিরাতুল মুস্তাকীম",
  description: "সিরাতুল মুস্তাকীম প্ল্যাটফর্মের ব্যবহারের নিয়ম ও শর্তাবলী।",
};

export default function TermsPage() {
  return (
    <section className={styles.section}>
      <Wrapper>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>টার্মস অফ সার্ভিস (Terms of Service)</h1>
          <p className={styles.subtitle}>
            সিরাতুল মুস্তাকীম প্ল্যাটফর্ম ব্যবহারের ক্ষেত্রে প্রযোজ্য নিয়মাবলী ও শর্তসমূহ।
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardDesc}>
            এই প্ল্যাটফর্মটি দ্বীনি জ্ঞান অর্জন ও ইসলামী শরীয়তের সঠিক দিকনির্দেশনা প্রচারের লক্ষ্যে পরিচালিত হচ্ছে।
          </p>
        </div>
      </Wrapper>
    </section>
  );
}
