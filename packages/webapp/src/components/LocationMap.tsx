import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  address?: string;
}

interface LocationMapProps {
  markers: MapMarker[];
  selectedId?: number | null;
  onMarkerClick?: (id: number) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

const BRAND_COLOR = "#a64833";

export function LocationMap({
  markers,
  selectedId,
  onMarkerClick,
  height = "240px",
  zoom,
  center,
}: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = center || [55.751, 37.618];
    const defaultZoom = zoom ?? 10;

    mapRef.current = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((point) => {
      const isSelected = selectedId === point.id;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width: ${isSelected ? "32px" : "24px"};
          height: ${isSelected ? "32px" : "24px"};
          background: ${isSelected ? BRAND_COLOR : "#73192a"};
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: all 0.2s;
          cursor: pointer;
        "></div>`,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 16] : [12, 12],
      });

      const marker = L.marker([point.lat, point.lng], { icon })
        .addTo(mapRef.current!);

      if (point.title) {
        marker.bindPopup(
          `<div style="font-family: Helvetica Neue, sans-serif; font-size: 13px;">
            <strong>${point.title}</strong>
            ${point.address ? `<br/><span style="color: #402a01;">${point.address}</span>` : ""}
          </div>`,
          { closeButton: false, offset: [0, -8] },
        );
      }

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(point.id));
      }

      if (isSelected) {
        marker.openPopup();
      }

      markersRef.current.push(marker);
    });
  }, [markers, selectedId, onMarkerClick]);

  // Pan to selected marker
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const point = markers.find((m) => m.id === selectedId);
    if (point) {
      mapRef.current.flyTo([point.lat, point.lng], 14, { duration: 0.5 });
    }
  }, [selectedId, markers]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    />
  );
}
