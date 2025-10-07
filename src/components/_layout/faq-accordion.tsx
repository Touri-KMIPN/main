"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from "./faq-accordion.data";

export function AccordionFAQ() {
  return (
    <>
      <Accordion type="single" collapsible className="space-y-2">
        {faqData.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-border/40 rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm transition-all duration-300 hover:bg-card/80"
          >
            <AccordionTrigger className="px-5 py-4 text-left font-medium text-lg hover:no-underline">
              <span className="text-foreground">{item.q}</span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 pt-2 text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
