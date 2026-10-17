import Header from "@/components/header";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import styles from "@/components/profile/profile-area.module.css";

/**
 * Shell for signed-in areas: the global header, a desktop left rail, and the
 * centered page content. Below the desktop breakpoint the rail is hidden and
 * content goes full-width (the header shows the section title instead).
 * TODO: add the auth check / redirect here once authentication exists.
 */
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header fullWidth isProtected />
      <div className={styles.page}>
        <ProfileSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
