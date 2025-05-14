"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import MapEvents from './MapEvents';
import { useState, useContext } from 'react';
import { MapContext } from './DynamicMap';

export default function Maps() {
  const { nowLatLng, setNowLatLng } = useContext(MapContext);
  const [actualLatLng, setActualLatLng] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    // マーカーアイコンの問題を修正
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    if (!nowLatLng) {
      navigator.geolocation.getCurrentPosition((position) => {
        setActualLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, (error) => {
        setActualLatLng({ lat: 35.681236, lng: 139.767125 });
      });
    }
  }, []);
  if (nowLatLng) {
  return  (
    <MapContainer
      center={[nowLatLng.lat, nowLatLng.lng]} 
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '80%', height: '500px', margin: '0 auto' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents />
    </MapContainer>
  );
} else {
  return actualLatLng && (
    <MapContainer
      center={[actualLatLng.lat, actualLatLng.lng]} 
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '80%', height: '500px', margin: '0 auto' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents />
    </MapContainer>
  )
}

}
