import Footer from "@/components/_layout/footer";
import Navbar from "@/components/_layout/navbar";
import CTASection from "@/components/_section/cta-section";
import HeroSection from "@/components/_section/hero-section";
import { IntrovertSection } from "@/components/_section/introvert-section";
import { PersonalizedSection } from "@/components/_section/personalized-section";
import { PopularDestinationsSection } from "@/components/_section/popular-destinations-section";
import React from "react";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Personalized Section */}
      <PersonalizedSection />

      {/* Introvert Section */}
      <IntrovertSection />

      {/* Popular Destinations Section */}
      <PopularDestinationsSection />

      {/* CTA */}
      <CTASection />
      
      <Footer />
    </>
  );
}
