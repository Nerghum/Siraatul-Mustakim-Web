import Header from "@/components/header";
import MobileAudioPlayer from "@/components/malfujat/MobileAudioPlayer";
import FloatingButtons from "@/components/shared/FloatingButtons";
import MobileAppBanner from "@/components/shared/MobileAppBanner";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

/** Shell for the public site: header + page content + mobile app banner. */
export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header fullWidth />
      <main className="main-content">{children}</main>
      <MobileAppBanner />
      <FloatingButtons />
      <MobileBottomNav />
      <MobileAudioPlayer />
    </>
  );
}
