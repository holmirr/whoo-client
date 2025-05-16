"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import MapEvents from './MapEvents';
import { useState, useContext } from 'react';
import { MapContext } from './DynamicMap';

export default function Maps() {
  const { nowLatLng, setNowLatLng, actualLatLng, setActualLatLng } = useContext(MapContext);

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
  
  let center: [number, number] | null;

  if (nowLatLng) {
    center = [nowLatLng.lat, nowLatLng.lng];
  } else if (actualLatLng) {
    center = [actualLatLng.lat, actualLatLng.lng];
  } else {
    center = null;
  }

  return center && (
    <MapContainer
      center={center} 
      zoom={16}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents />
    </MapContainer>
  );

}
