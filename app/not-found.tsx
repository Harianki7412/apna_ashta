import Link from "next/link";
import { Home, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <Compass size={48} className="text-brand-600" />
        </div>

        <h1 className="text-6xl font-extrabold text-brand-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Yeh page exist nahi karta ya move ho gaya hai.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-8">
          <Link href="/" className="btn btn-primary">
            <Home size={16} /> Home
          </Link>
          <Link href="/properties" className="btn btn-secondary">
            <Search size={16} /> Browse Properties
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">Popular pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/rent-in/ashta" className="badge badge-brand">
              Ashta Rentals
            </Link>
            <Link href="/rent-in/sehore" className="badge badge-brand">
              Sehore Rentals
            </Link>
            <Link href="/rent-in/kothri" className="badge badge-brand">
              Kothri Rentals
            </Link>
            <Link href="/faq" className="badge badge-brand">
              FAQ
            </Link>
            <Link href="/contact" className="badge badge-brand">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
