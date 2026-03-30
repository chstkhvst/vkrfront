import React from "react";
import Map, { Marker } from "react-map-gl/maplibre";

const MAP_STYLE = "https://tiles.stadiamaps.com/styles/osm_bright.json";
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type Props = {
  lat: number;
  lng: number;
};

export const MapView: React.FC<Props> = ({ lat, lng }) => {
  if (!lat || !lng) return null;

  return (
    <Map
      initialViewState={{
        latitude: lat,
        longitude: lng,
        zoom: 13,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
    >
      <Marker longitude={lng} latitude={lat} anchor="bottom">
        📍
      </Marker>
    </Map>
  );
};