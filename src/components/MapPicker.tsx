import Map, { Marker } from "react-map-gl/maplibre";

const MAP_STYLE = "https://tiles.stadiamaps.com/styles/alidade_smooth.json";

export const MapPicker = ({ coords, setCoords }: any) => {
  return (
    <Map
      key={`${coords.lat}-${coords.lng}`} // заставляет карту обновляться
      initialViewState={{
        latitude: coords.lat ?? 52.37,
        longitude: coords.lng ?? 34.89,
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      onClick={(e) => {
        const { lat, lng } = e.lngLat;
        setCoords({ lat, lng });
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