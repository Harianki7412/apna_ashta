"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ properties }: { properties: any[] }) {
  const center: [number, number] = properties[0]?.location?.coordinates
    ? [
        properties[0].location.coordinates[1],
        properties[0].location.coordinates[0],
      ]
    : [23.0167, 76.7167];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      {properties.map((p) => (
        <Marker
          key={p._id}
          icon={icon}
          position={[p.location.coordinates[1], p.location.coordinates[0]]}
        >
          <Popup>
            <div className="w-48">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-full h-24 object-cover rounded"
                />
              )}
              <p className="font-semibold mt-1 text-sm">{p.title}</p>
              <p className="text-blue-600 text-sm">₹{p.rent}/mo</p>
              <Link href={`/properties/${p._id}`} className="text-xs underline">
                View
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
