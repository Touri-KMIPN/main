import { AlignJustifyIcon, CompassIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed w-full z-50 xl:pt-4">
      <div className="bg-background/10 backdrop-blur max-w-7xl py-4 px-8 xl:rounded-full mx-auto flex items-center justify-between border border-border">
        <Link href={"/"} className="flex items-center gap-2">
          <div className="">
            <Image
              src={"/LogowText.png"}
              className="overflow-hidden"
              alt="Touri"
              width={50}
              height={50}
            />
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" className="lg:hidden">
            <AlignJustifyIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
