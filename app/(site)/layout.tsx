import { SiteHeader } from "@/components/site-header";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { PopupVideo } from "@/components/popup-video";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <FloatingWhatsApp />
      <PopupVideo />
    </>
  );
}
