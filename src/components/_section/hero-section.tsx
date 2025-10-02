import { SparklesIcon, StarIcon } from 'lucide-react';
import React from 'react'
import { Button } from '../ui/button';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              <SparklesIcon className="w-4 h-4" />
              <span>Pemandu Wisata AI di Saku Anda</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              Jelajahi Dunia dengan <span className="text-primary">Touri</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto lg:mx-0">
              Pemandu wisata AI yang cerdas dan personal. Dapatkan rekomendasi
              tempat, rute perjalanan, dan informasi budaya lokal dalam
              genggaman Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-base px-8 h-12 rounded-xl">
                Unduh Sekarang
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 rounded-xl bg-transparent"
              >
                Lihat Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <StarIcon className="w-4 h-4 fill-accent text-accent" />
                <span>4.9 Rating</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div>100K+ Pengguna</div>
              <div className="w-px h-4 bg-border" />
              <div>50+ Negara</div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 mx-auto w-full max-w-sm lg:max-w-md">
              <div className="relative aspect-[9/19] bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-card rounded-[2.5rem] overflow-hidden border border-border">
                  <img
                    src="/modern-travel-app-ui-showing-map-with-location-pin.jpg"
                    alt="Touri App Interface"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-card rounded-full border border-border" />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-2xl blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-2xl blur-2xl animate-pulse delay-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
