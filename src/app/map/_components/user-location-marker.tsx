import React from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { UserIcon } from "lucide-react";

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  latitude,
  longitude,
}) => {
  return (
    <AdvancedMarker position={{ lat: latitude, lng: longitude }}>
      <div className="p-2 rounded-full bg-blue-500 text-white shadow-lg animate-user-location">
        <UserIcon className="size-4" />
      </div>
    </AdvancedMarker>
  );
};

export default UserLocationMarker;
