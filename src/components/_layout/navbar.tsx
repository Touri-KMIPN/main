import { AlignJustifyIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed w-full z-50 xl:pt-4">
      <div className="bg-background/80 backdrop-blur-sm max-w-7xl py-2 px-4 xl:rounded-full mx-auto flex items-center justify-between border">
        <Link href={"/"} className="flex items-center gap-2 focus:outline-none">
          <div className="flex items-center gap-2">
            <Image
              src={"/icon/Touri.webp"}
            className="overflow-hidden"
              alt="Touri"
              width={40}
              height={40}
            />
            <span className="font-black text-2xl mt-1">Touri</span>
          </div>
        </Link>
        <nav className="text-sm hidden lg:block">
        <ul className="flex items-center gap-8">
            <li>
              <Link className="hover:text-primary/90" href="#how-to-use">How to Use</Link>
            </li>
            <li>
              <Link className="hover:text-primary/90" href="#popular">Popular Destinations</Link>
            </li>
            <li>
              <Link className="hover:text-primary/90" href="#faq">FAQ</Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center justify-center gap-4">
          <Link href={"/chat?new=true"}>
            <Button variant={"secondary"} className="rounded-full cursor-pointer">
              Get Started!
            </Button>
          </Link>
          <ModeToggle />
          {/* <Button variant={"secondary"} className="lg:hidden">
            <AlignJustifyIcon />
          </Button> */}
        </div>
      </div>
    </header>
  );
}
