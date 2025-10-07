import Image from "next/image"

export function IntrovertSection() {
  return (
    <section className="py-32">
        <div className="grid lg:grid-cols-3 gap-12 px-6 items-center max-w-6xl mx-auto">
          {/* Content */}
          <div className="space-y-6 lg:order-1 lg:col-span-2">
            <h2 className="text-4xl lg:text-5xl font-semibold text-primary text-balance">Why Touri?</h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Use Touri as your travel consultant. Get all the local insights, hidden gems, 
              and expert recommendations through our AI assistant - available 24/7, just for you.
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-muted-foreground">Travel at your own pace without group pressure</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-muted-foreground">Get local knowledge without awkward conversations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-muted-foreground">Discover quiet spots and peaceful experiences</span>
              </li>
            </ul>
          </div>

          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl lg:order-2 animate-bounce-slow">
            <Image
              src="/solo-traveler-peaceful-temple.jpg"
              alt="Solo traveler enjoying peaceful moment at temple"
              fill
              className="object-cover"
            />
          </div>
        </div>
    </section>
  )
}
