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
import DestinationCard from "../_layout/destination-card";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-24 lg:py-48 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-4 lg:col-span-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              <SparklesIcon className="w-4 h-4" />
              <span>Personalized AI Tour Guide</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              Your Tour Guide In Your Pocket with {" "}
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

          <div className="relative max-w-md mx-auto animate-bounce-slow">
            {/* Main image card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/beautiful-bali-rice-terraces-at-sunset-with-tradit.jpg"
                alt="Bali Indonesia"
                width={500}
                height={600}
                className="w-full h-120 object-cover"
              />
              {/* Overlay chat bubble */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium">Touri AI</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Saya menemukan 5 tempat tersembunyi di Bali yang sempurna
                      untuk fotografi! Mau lihat rekomendasinya?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="hidden md:block absolute -top-6 -right-6 bg-background rounded-2xl p-4 shadow-xl border border-border">
              <DestinationCard
                title="Raja Ampat"
                subTitle="Papua Barat"
                imageUrl="/raja-ampat-turquoise-water.jpg"
              />
            </div>

            <div className="hidden md:block absolute -bottom-6 -left-6 bg-background rounded-2xl p-4 shadow-xl border border-border">
              <DestinationCard
                title="Borobudur"
                subTitle="Jawa Tengah"
                imageUrl="/borobudur-temple-sunrise.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
