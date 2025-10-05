import { AlignJustifyIcon, CompassIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed w-full z-50 xl:pt-4">
      <div className="bg-background/80 backdrop-blur-sm max-w-7xl py-2 px-4 lg:px-8 xl:rounded-full mx-auto flex items-center justify-between border">
        <Link href={"/"} className="flex items-center gap-2 focus:outline-none">
          <div className="flex items-center gap-2">
            <Image
              src={"/Touri.webp"}
              className="overflow-hidden"
              alt="Touri"
              width={40}
              height={40}
            />
            <span className="font-black text-2xl mt-1">Touri</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant={"secondary"} className="lg:hidden">
            <AlignJustifyIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
