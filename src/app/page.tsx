import Footer from "@/components/_layout/footer";
import Navbar from "@/components/_layout/navbar";
import CTASection from "@/components/_section/cta";
import HeroSection from "@/components/_section/hero-section";
import React from "react";

export default function LandingPage() {
  return (
    <div className="mx-auto">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* CTA */}
      <CTASection />
      
      <Footer />
    </div>
  );
}
