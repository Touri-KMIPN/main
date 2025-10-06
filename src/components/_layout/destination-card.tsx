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
      <div className="w-12 h-12 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={48}
          height={48}
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subTitle}</p>
      </div>
    </div>
  );
}
