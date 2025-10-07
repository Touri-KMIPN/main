# Place Icons Implementation

This implementation demonstrates how to use the `Record<PlaceTypeUnion, React.ForwardRefExoticComponent>` pattern for mapping Google Maps place types to Lucide React icons.

## Key Features

### 1. Type-Safe Place Types

```typescript
export type PlaceType =
  | "restaurant"
  | "cafe"
  | "bar"
  | "hospital"
  | "school"
  | "bank"
  | "gas_station"
  | "pharmacy"
  | "post_office"
  | "police"
  | "fire_station";
// ... and many more
```

### 2. Icon Mapping Using Record Pattern

```typescript
export const placeIconMap: Record<
  PlaceType,
  React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >
> = {
  restaurant: ChefHat,
  cafe: Coffee,
  bar: Wine,
  hospital: Building2,
  school: GraduationCap,
  // ... maps each place type to its corresponding Lucide icon
};
```

## Usage Examples

### Basic Usage

```typescript
import { getPlaceIcon } from "@/lib/place-icons";

const Icon = getPlaceIcon("restaurant");
// Icon = ChefHat component
```

### In React Components

```tsx
const Icon = getPlaceIcon(placeType);

return (
  <div className="p-2 rounded-full border bg-white text-black">
    <Icon className="size-4" />
  </div>
);
```

### With Google Maps Markers

```tsx
{
  props.pois.map((poi) => {
    const primaryType = poi.types[0] as PlaceType;
    const Icon = getPlaceIcon(primaryType);

    return (
      <AdvancedMarker position={poi.location}>
        <div className="p-2 rounded-full border bg-white text-black">
          <Icon className="size-4" />
        </div>
      </AdvancedMarker>
    );
  });
}
```

## Benefits

1. **Type Safety**: Full TypeScript support with autocomplete
2. **Consistency**: Centralized icon management
3. **Scalability**: Easy to add new place types
4. **Performance**: Icons are imported only when needed
5. **Maintainability**: Single source of truth for place type icons

## Adding New Place Types

1. Add the new type to the `PlaceType` union in `src/types/spot.d.ts`
2. Add the icon mapping in `src/lib/place-icons.tsx`
3. Import the new icon from `lucide-react`

## Integration with Google Places API

This system is designed to work seamlessly with Google Places API responses:

```typescript
// Google Places API response
const place = {
  place_id: "ChIJ...",
  types: ["restaurant", "food", "establishment"],
  name: "Amazing Restaurant",
};

// Use the first type as primary
const primaryType = place.types[0] as PlaceType;
const Icon = getPlaceIcon(primaryType);
```

## Demo Component

Use the `PlaceTypeDemo` component to see all available place types with their icons:

```tsx
import PlaceTypeDemo from "@/components/place-type-demo";

// Renders a grid showing all place types with their icons
<PlaceTypeDemo />;
```
