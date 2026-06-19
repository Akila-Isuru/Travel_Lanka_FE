import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Destination {
  _id: string;
  name: string;
  slug: string;
  coordinates: { coordinates: [number, number] };
  location: string;
  pricePerNight: number;
}

interface Props {
  currentDest: Destination;
  nearbyDests: Destination[];
}

const DestinationMap: React.FC<Props> = ({ currentDest, nearbyDests }) => {
  const [center, setCenter] = useState<[number, number]>([7.8731, 80.7718]); // default Sri Lanka

  useEffect(() => {
    if (currentDest?.coordinates?.coordinates) {
      const [lng, lat] = currentDest.coordinates.coordinates;
      setCenter([lat, lng]);
    }
  }, [currentDest]);

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "400px", width: "100%" }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
      />
     
      {currentDest?.coordinates?.coordinates && (
        <Marker
          position={[
            currentDest.coordinates.coordinates[1],
            currentDest.coordinates.coordinates[0],
          ]}
        >
          <Popup>
            <strong>{currentDest.name}</strong>
            <br />
            {currentDest.location}
            <br />
            <span className="text-[#C9922A]">
              ${currentDest.pricePerNight}/night
            </span>
          </Popup>
        </Marker>
      )}
      
      {nearbyDests.map((dest) => {
        if (!dest.coordinates?.coordinates) return null;
        return (
          <Marker
            key={dest._id}
            position={[
              dest.coordinates.coordinates[1],
              dest.coordinates.coordinates[0],
            ]}
            icon={L.divIcon({
              className: "bg-blue-500 rounded-full w-3 h-3",
              iconSize: [12, 12],
            })}
          >
            <Popup>
              <strong>{dest.name}</strong>
              <br />
              {dest.location}
              <br />
              <a
                href={`/destination/${dest.slug}`}
                className="text-[#C9922A] text-xs"
              >
                View Details →
              </a>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default DestinationMap;
