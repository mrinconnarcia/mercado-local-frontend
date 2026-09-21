import { type ReactNode } from "react";
import { BusinessPanelProvider } from "@/src/lib/business-context";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <BusinessPanelProvider>{children}</BusinessPanelProvider>;
}