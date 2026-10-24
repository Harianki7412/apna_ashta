import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto p-6 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Apna Ashta · Made in Ashta, MP</p>
        <div className="flex gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/properties">Browse</Link>
        </div>
      </div>
    </footer>
  );
}
