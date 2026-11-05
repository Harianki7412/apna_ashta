import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Homes for Rent",
  description:
    "Search verified rooms, flats, and houses for rent in Ashta. Compare monthly rent, amenities, and connect directly with property owners.",
  path: "/properties",
});

export default function PropertiesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
