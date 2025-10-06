import React from 'react';
import { getPlaceIcon } from '@/lib/place-icons';
import type { PlaceType } from '@/types/spot';

// Demo component showing all place types with their icons
const PlaceTypeDemo = () => {
  const placeTypes: PlaceType[] = [
    'restaurant', 'cafe', 'bar', 'hospital', 'school', 'bank',
    'gas_station', 'pharmacy', 'post_office', 'police', 'fire_station', 'library',
    'tourist_attraction', 'museum', 'zoo', 'amusement_park', 'aquarium',
    'art_gallery', 'church', 'mosque', 'temple', 'synagogue',
    'park', 'airport', 'train_station', 'bus_station', 'subway_station',
    'shopping_mall', 'store', 'supermarket', 'clothing_store',
    'locality', 'administrative_area_level_1', 'country', 'neighborhood',
    'point_of_interest', 'establishment', 'landmark'
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Place Type Icons Demo</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {placeTypes.map((placeType) => {
          const Icon = getPlaceIcon(placeType);
          
          return (
            <div key={placeType} className="flex flex-col items-center p-3 border rounded-lg">
              <div className="p-3 rounded-full bg-white border text-black mb-2">
                <Icon className="size-6" />
              </div>
              <span className="text-xs text-center font-medium">
                {placeType.replace(/_/g, ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaceTypeDemo;
