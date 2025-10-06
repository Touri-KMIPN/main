import Footer from "@/components/_layout/footer";
import Navbar from "@/components/_layout/navbar";
import CTASection from "@/components/_section/cta-section";
import FAQSection from "@/components/_section/faq-serction";
import HeroSection from "@/components/_section/hero-section";
import HowToUseSection from "@/components/_section/how-to-use-section";
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

      {/* How To Use Section */}
      <div id="how-to-use">
        <HowToUseSection />
      </div>

      {/* Popular Destinations Section */}
      <div id="popular">
        <PopularDestinationsSection />
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <FAQSection />
      </div>

      {/* CTA */}
      <CTASection />

      <Footer />
    </>
  );
}
