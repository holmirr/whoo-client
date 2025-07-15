"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import MapEvents from './MapEvents';
import { useState, useContext } from 'react';
import { MapContext } from '../DynamicMap';

export default function Maps() {
  const { nowLatLng, setNowLatLng, token } = useContext(MapContext);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/?${new URLSearchParams({ token })}`);

    ws.onopen = () => {
      console.log('WebSocket接続が確立しました');
    };

    ws.onmessage = (event) => {
      console.log('サーバーからのメッセージ:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket接続が閉じました');
    };

    ws.onerror = (error) => {
      console.log('WebSocketエラー:', error);
    };
    
    // マーカーアイコンの問題を修正
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    if (!nowLatLng) {
      navigator.geolocation.getCurrentPosition((position) => {
        setNowLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, (error) => {
        setNowLatLng({ lat: 35.681236, lng: 139.767125 });
      });
    }

    return () => {
      ws.close();
    };
  }, []);
  
  return nowLatLng && (
    <MapContainer
      center={[nowLatLng.lat, nowLatLng.lng]}
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
