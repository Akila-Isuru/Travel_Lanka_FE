// frontend/src/components/ItineraryMap.tsx
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
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
  coordinates?: { coordinates: [number, number] };
  location: string;
}

const ItineraryMap: React.FC<{ destinations: Destination[] }> = ({
  destinations,
}) => {
  const validDestinations = destinations.filter(
    (d) => d?.coordinates?.coordinates,
  );
  if (validDestinations.length === 0)
    return (
      <div className="bg-gray-100 h-64 flex items-center justify-center">
        No map data available
      </div>
    );

  const center: [number, number] = [
    validDestinations[0].coordinates!.coordinates[1],
    validDestinations[0].coordinates!.coordinates[0],
  ];
  const positions: [number, number][] = validDestinations.map((d) => [
    d.coordinates!.coordinates[1],
    d.coordinates!.coordinates[0],
  ]);

  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: "400px", width: "100%" }}
      className="rounded shadow"
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {positions.map((pos, i) => (
        <Marker key={i} position={pos}>
          <Popup>{validDestinations[i].name}</Popup>
        </Marker>
      ))}
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          color="#C9922A"
          weight={3}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
};

export default ItineraryMap;
