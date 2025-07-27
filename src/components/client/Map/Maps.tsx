"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import MapEvents from './MapEvents';
import { useContext } from 'react';
import { MapContext } from '../DynamicMap';
import type { UserInfo, walkingResponse } from '@/libs/types';

declare global {
  interface WebSocket {
    isActive?: boolean;
  }
}

export default function Maps() {
  const { nowLatLng, setNowLatLng, token, usersInfo, setUsersInfo, batteryLevel, setIsReflecting, wsRef, setIsWalking } = useContext(MapContext);

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
      }, (error) => {
        setNowLatLng({ lat: 35.681236, lng: 139.767125 });
      });
    }


    const connectWs = () => {
      try {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_SERVER}/?${new URLSearchParams({ token })}`);
        wsRef.current = ws;
        ws.onopen = () => {
          console.log('WebSocket接続が確立しました');
        };

        ws.onmessage = (event: MessageEvent<string>) => {
          try {
            const msg = event.data;
            if (msg === "ping") {
              wsRef.current?.send("pong");
              return;
            }
            const data = JSON.parse(msg) as walkingResponse;
            switch (data.type) {
              case "walking":
                data.data ? setIsWalking(true) : setIsWalking(false);
                break;
              case "location":
                if (data.data.id === 0) {
                  setNowLatLng({ lat: data.data.lat, lng: data.data.lng });
                } else {
                  setUsersInfo((prevUsersInfo: UserInfo[]) => prevUsersInfo.map(user => user.id === data.data.id ? { ...user, lat: data.data.lat, lng: data.data.lng } : user));
                }
                break;
              case "error":
              case "success":
              case "stopped":
                console.log(data.detail);
                if (data.finish) {
                  setIsWalking(false);
                }
                break;
            }
          } catch (error) {
            console.error(error);
          }
        };
        ws.onclose = () => {
          console.log('WebSocket接続が閉じました');
          if (wsRef.current === ws) {
            wsRef.current = null;
          }
        };
        ws.onerror = (error) => {
          console.log('WebSocketエラー:', error);
        };
      } catch (error) {
        console.error(error);
      }
    }

    connectWs();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wsRef.current) {
        connectWs();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wsRef.current?.close();
      wsRef.current = null;
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
