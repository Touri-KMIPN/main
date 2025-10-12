import Image from "next/image";
import React from "react";

export default function PhoneMockup() {
  return (
    <>
      <div className="relative z-10 mx-auto max-w-xs">
        <div className="relative aspect-[7/15] bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] p-3 shadow-2xl">
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden border">
            <Image
              src="/images/mockup-vc.webp"
              alt="Touri App Interface"
              width={900}
              height={1600}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-card rounded-full border border-border" />
        </div>
      </div>
    </>
  );
}
