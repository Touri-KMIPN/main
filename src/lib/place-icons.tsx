import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  ChefHat,
  Coffee,
  Wine,
  Building2,
  GraduationCap,
  Banknote,
  Fuel,
  Pill,
  Mail,
  Shield,
  Flame,
  BookOpen,
  Camera,
  Building,
  TreePine,
  Plane,
  Train,
  Bus,
  TrainFront,
  ShoppingBag,
  Store,
  ShoppingCart,
  Shirt,
  MapPin,
  Landmark,
  Star,
  UtensilsCrossed,
  Car,
  Heart,
  Home,
  Navigation
} from 'lucide-react';
import type { PlaceType } from '@/types/spot';

// Icon mapping using Record pattern
export const placeIconMap: Record<PlaceType, React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>> = {
  // Establishments
  restaurant: ChefHat,
  cafe: Coffee,
  bar: Wine,
  hospital: Building2,
  school: GraduationCap,
  bank: Banknote,
  gas_station: Fuel,
  pharmacy: Pill,
  post_office: Mail,
  police: Shield,
  fire_station: Flame,
  library: BookOpen,
  
  // Tourist attractions
  tourist_attraction: Camera,
  museum: Building,
  zoo: TreePine,
  amusement_park: Star,
  aquarium: TreePine,
  art_gallery: Camera,
  church: Building,
  mosque: Building,
  temple: Building,
  synagogue: Building,
  
  // Geographic
  park: TreePine,
  airport: Plane,
  train_station: Train,
  bus_station: Bus,
  subway_station: TrainFront ,
  shopping_mall: ShoppingBag,
  store: Store,
  supermarket: ShoppingCart,
  clothing_store: Shirt,
  
  // Administrative
  locality: MapPin,
  administrative_area_level_1: MapPin,
  country: MapPin,
  neighborhood: Home,
  
  // Points of interest
  point_of_interest: Star,
  establishment: Building,
  landmark: Landmark
};


// Helper function to get icon for a place type
export const getPlaceIcon = (placeType: PlaceType) => {
  return placeIconMap[placeType] || MapPin;
};
