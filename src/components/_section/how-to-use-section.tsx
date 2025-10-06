import React from "react";
import { Card } from "../ui/card";
import { HowToUseStepsData } from "./how-to-use-section.data";

export default function HowToUseSection() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold text-primary text-balance">
            How To Use
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
            Start Exploration With Only 4 Easy Steps
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {HowToUseStepsData.map((step, index) => (
            <Card
              key={index}
              className="p-6 space-y-2 relative flex border-border bg-card"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {step.step}
                </span>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent self-center lg:self-baseline flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
