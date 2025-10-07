import PhoneMockup from "../_layout/phone-mockup";

export function PersonalizedSection() {
  return (
    <section className="py-32 bg-muted">
      <div className="grid lg:grid-cols-3 px-6 max-w-6xl gap-12 mx-auto w-full items-center ">
        <div className="mx-auto w-full order-2 lg:order-1">
          <PhoneMockup />
        </div>

        {/* Content */}
        <div className="space-y-6 lg:col-span-2 order-1 lg:order-2">
          <h2 className="text-4xl lg:text-5xl text-primary font-semibold text-balance">
            Personalized Only For You!
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Describe your dream place or what kind of place do you want, then
            get your recommendation. Our AI understands your preferences,
            budget, and travel style to create the perfect itinerary tailored
            just for you.
          </p>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-muted-foreground">
                Tell us your travel preferences and interests
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-muted-foreground">
                Get instant recommendations based on your style
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-muted-foreground">
                Refine and adjust until it's perfect for you
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
