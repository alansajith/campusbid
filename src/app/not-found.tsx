import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Gavel } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6"
          >
            <Gavel className="w-10 h-10 text-white" />
          </div>
          <p className="text-6xl font-bold mb-4 gradient-text" style={{ fontFamily: "var(--font-outfit)" }}>
            404
          </p>
          <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
          <p className="mb-8" style={{ color: "hsl(215 20% 50%)" }}>
            The page you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
