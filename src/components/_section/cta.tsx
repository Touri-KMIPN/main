import { Search } from 'lucide-react';
import React from 'react';

export default function CTASection() {
  return (
    <div
      className="relative bg-cover bg-center bg-fixed py-20 px-4"
      style={{
        backgroundImage: `url('/images/ampera-unsplash.webp')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80 backdrop-blur-sm"></div>

      <div className="relative container mx-auto text-center z-10 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Where we going today?
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover amazing places and experiences with our AI tour guide
        </p>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your destination..."
              className="w-full p-5 rounded-full bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary shadow-xl shadow-primary/10 transition-all duration-300"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-4 rounded-full hover:bg-primary/90 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
              <Search size={22} />
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <span className="text-sm text-muted-foreground/80">Try searching:</span>
          <button className="text-sm text-foreground/80 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground">
            Ampera Bridge
          </button>
          <button className="text-sm text-foreground/80 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground">
            Monument in Padang
          </button>
          <button className="text-sm text-foreground/80 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground">
            Padang's Culinary
          </button>
          <button className="text-sm text-foreground/80 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground">
            Padang Beach
          </button>
        </div>
      </div>
    </div>
  );
}
