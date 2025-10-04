import {
  MapIcon,
  MapPinCheckIcon,
  MessageCircleIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              <SparklesIcon className="w-4 h-4" />
              <span>Personalized AI Tour Guide</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              Your Tour Guide In Your Pocket with{" "}
              <span className="text-primary">Touri</span>!
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto lg:mx-0">
              A smart and personalized AI tour guide. Get recommendations for
              places, travel routes, and local cultural information at your
              fingertips.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={"/chat"}>
                <Button size="lg" className="text-base px-8 h-12 rounded-full">
                  <MapIcon />
                  Start Your Journey
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 rounded-full bg-transparent"
              >
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <StarIcon className="w-4 h-4 text-accent-foreground" />
                <span>5.0 Rating</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <MapPinCheckIcon className="w-4 h-4 text-accent-foreground" />
                100+ Destination
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <MessageCircleIcon className="w-4 h-4 text-accent-foreground" />
                10+ Reviews
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative animate-bounce-slow">
            <div className="relative z-10 mx-auto w-full max-w-sm lg:max-w-md">
              <div className="relative aspect-[9/16] bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border">
                  <Image
                    src="/MapBackground.webp"
                    alt="Touri App Interface"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-card rounded-full border border-border" />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/20 rounded-2xl blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-2xl blur-2xl animate-pulse delay-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
