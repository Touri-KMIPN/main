import { NavigationIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Search, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="py-6 px-4 flex flex-col md:flex-row justify-between items-center gap-6 mx-auto max-w-7xl">

        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Touri. All rights reserved.
          </p>
        </div>

        {/* Social Media */}
        <div className="flex space-x-5">
          <Link
            href="#"
            className="text-foreground hover:text-primary/80 transition-colors"
          >
            <Facebook size={24} />
          </Link>
          <Link
            href="#"
            className="text-foreground hover:text-primary/80 transition-colors"
          >
            <Twitter size={24} />
          </Link>
          <Link
            href="#"
            className="text-foreground hover:text-primary/80 transition-colors"
          >
            <Instagram size={24} />
          </Link>
          <Link
            href="#"
            className="text-foreground hover:text-primary/80 transition-colors"
          >
            <Youtube size={24} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
