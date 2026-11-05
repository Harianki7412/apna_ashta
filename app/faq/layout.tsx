import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers for tenants and property owners about finding rentals, listing homes, payments, and staying safe on Flatova.",
  path: "/faq",
});

export default function FAQLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
