import { useEffect, useRef } from "react";
import Map, { Marker } from "react-map-gl/maplibre";

const MAP_STYLE = "https://tiles.stadiamaps.com/styles/osm_bright.json";

export const MapPicker = ({ coords, setCoords, onLocationSelect }: any) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap?.() || mapRef.current;
    
    if (!map || !coords.lat || !coords.lng) return;

    console.log("FLY TO", coords);
    map.flyTo({
      center: [coords.lng, coords.lat],
      duration: 800,
      zoom: 12,
    });
  }, [coords.lat, coords.lng]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: coords.lat ?? 56.45,
        longitude: coords.lng ?? 35.37,
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      onClick={(e) => {
        const { lat, lng } = e.lngLat;
        setCoords({ lat, lng });
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      }}
    >
      {coords.lat && coords.lng && (
        <Marker longitude={coords.lng} latitude={coords.lat}>
          📍
        </Marker>
      )}
    </Map>
  );
};