import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Plans and Pricing",
  description:
    "Explore Flatova plans for property owners. Compare listing upgrades and choose the right option for your rental property.",
  path: "/pricing",
});

export default function PricingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
