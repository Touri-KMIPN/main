import React from "react";
import { AccordionFAQ } from "../_layout/faq-accordion";

export default function FAQSection() {
  return (
    <section className="py-16 lg:py-32 px-6 bg-muted">
      <div className="max-w-6xl mx-auto grid grid-cols-1 items-center">
        <div className="space-y-4 max-w-3xl mb-16 mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-primary text-balance">
            FAQ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
            Frequently Asked Questions About Touri
          </p>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          <AccordionFAQ />
        </div>
      </div>
    </section>
  );
}
