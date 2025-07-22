"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import MapEvents from './MapEvents';
import { useState, useContext } from 'react';
import { MapContext } from '../DynamicMap';
import { UserInfo } from '@/libs/types';
import { updatePinsLatLng } from '@/action';

export default function Maps() {
  const { nowLatLng, setNowLatLng, token, usersInfo, setUsersInfo, batteryLevel } = useContext(MapContext);

  useEffect(() => {
    
    // マーカーアイコンの問題を修正
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    if (!nowLatLng) {
      navigator.geolocation.getCurrentPosition((position) => {
        setNowLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
        updatePinsLatLng({ lat: position.coords.latitude, lng: position.coords.longitude }, batteryLevel/100);
      }, (error) => {
        setNowLatLng({ lat: 35.681236, lng: 139.767125 });
        updatePinsLatLng({ lat: 35.681236, lng: 139.767125 }, batteryLevel/100);
      });
    } else {
      updatePinsLatLng({ lat: nowLatLng.lat, lng: nowLatLng.lng }, batteryLevel/100);
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_SERVER}/?${new URLSearchParams({ token })}`);
    } catch (error) {
      console.error(error);
      return;
    }
    ws.onopen = () => {
      console.log('WebSocket接続が確立しました');
    };
    ws.onmessage = (event) => {
      const msg: string = event.data;
      if (msg === "ping") {
        ws.send("pong");
        return;
      }
      const data = JSON.parse(msg) as { type: string, data: { lat: number, lng: number }, id: number };
      console.log(data);
      if (data.type === "location") {
        if (data.id === 0) {
          setNowLatLng({ lat: data.data.lat, lng: data.data.lng });
        } else {
          setUsersInfo(usersInfo.map(user => user.id === data.id ? { ...user, lat: data.data.lat, lng: data.data.lng } : user));
        }
      }
    };
    ws.onclose = () => {
      console.log('WebSocket接続が閉じました');
    };
    ws.onerror = (error) => {
      console.log('WebSocketエラー:', error);
    };
    
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
