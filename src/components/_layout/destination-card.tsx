"use client"
import Image from "next/image";
import React from "react";

type DestinationCardProps = {
    title: string,
    subTitle: string,
    imageUrl: string
}

export default function DestinationCard({title, subTitle, imageUrl }: DestinationCardProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={100}
          height={100}
          className="object-cover w-12 h-12 aspect-square overflow-hidden"
        />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subTitle}</p>
      </div>
    </div>
  );
}
