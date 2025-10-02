import HeroSection from "@/components/_section/hero-section";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlignJustifyIcon,
  CameraIcon,
  CompassIcon,
  GlobeIcon,
  MapPinIcon,
  MessageSquareIcon,
  NavigationIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";
import React from "react";

export default function LandingPage() {
  return (
    <div className="mx-auto">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <section
        id="cara-kerja"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
              Bagaimana Touri Bekerja
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Tiga langkah sederhana untuk memulai petualangan Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="p-8 space-y-6 border-2 hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <MapPinIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-card-foreground">
                  Pilih Destinasi
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Masukkan kota atau negara yang ingin Anda kunjungi. Touri akan
                  menganalisis preferensi Anda.
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-6 border-2 hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-card-foreground">
                  AI Merencanakan
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI kami membuat itinerary personal berdasarkan minat, budget,
                  dan waktu perjalanan Anda.
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-6 border-2 hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <NavigationIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-card-foreground">
                  Mulai Jelajah
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ikuti panduan real-time, dapatkan tips lokal, dan nikmati
                  perjalanan tanpa khawatir.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Semua yang Anda butuhkan untuk perjalanan sempurna
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageSquareIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">
                Chat AI Interaktif
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tanya apa saja tentang destinasi Anda. AI kami siap menjawab
                24/7 dalam bahasa Indonesia.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <GlobeIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">
                Offline Mode
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Akses peta dan panduan wisata tanpa koneksi internet. Sempurna
                untuk petualangan remote.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CameraIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">
                Visual Recognition
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Foto landmark atau makanan, dan dapatkan informasi lengkap
                secara instan.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">
                Rekomendasi Personal
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Temukan tempat tersembunyi yang sesuai dengan selera dan budget
                Anda.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <NavigationIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">
                Navigasi Real-time
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Panduan turn-by-turn dengan estimasi waktu dan alternatif rute
                terbaik.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">
                Review & Rating
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Baca ulasan traveler lain dan bagikan pengalaman perjalanan
                Anda.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="unduh"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-accent/10"
      >
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Siap Memulai Petualangan?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Unduh Touri sekarang dan rasakan pengalaman traveling yang lebih
            cerdas dan menyenangkan
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a href="#" className="inline-block">
              <img
                src="/app-store-download-badge-black.jpg"
                alt="Download on App Store"
                className="h-14"
              />
            </a>
            <a href="#" className="inline-block">
              <img
                src="/images/google-play-badge.png"
                alt="Get it on Google Play"
                className="h-14"
              />
            </a>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background" />
              </div>
              <span>Bergabung dengan 100K+ travelers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <CompassIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Touri</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Tentang
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Blog
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Bantuan
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privasi
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Syarat
              </a>
            </nav>

            <p className="text-sm text-muted-foreground">
              © 2025 Touri. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
