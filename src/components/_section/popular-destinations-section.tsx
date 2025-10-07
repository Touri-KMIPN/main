"use client";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { destinations } from "./popular-destinations.data";

export function PopularDestinationsSection() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold text-primary text-balance">
            Popular Destinations
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
            Explore the beauty of Indonesia from Sabang to Merauke
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {destinations.map((destination, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="group cursor-pointer rounded-2xl overflow-hidden relative aspect-[3/4] hover:shadow-2xl transition-all">
                    {/* Full-bleed image */}
                    <Image
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      {/* Top section - attractions badge */}
                      <div className="flex justify-end">
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30">
                          {destination.attractions}
                        </Badge>
                      </div>

                      {/* Bottom section - title, description, and rating */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-white" />
                          <h3 className="text-2xl md:text-3xl font-bold text-white">
                            {destination.name}
                          </h3>
                        </div>
                        <p className="text-white/90 leading-relaxed text-sm md:text-base">
                          {destination.description}
                        </p>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-white">
                            {destination.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
