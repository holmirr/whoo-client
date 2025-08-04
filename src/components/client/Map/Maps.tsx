"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import MapEvents from './MapEvents';
import { useContext } from 'react';
import { MapContext } from '../DynamicMap';

// defaultのWebSocketオブジェクトのタイプを拡張し、isActiveプロパティを追加する
declare global {
  interface WebSocket {
    isActive?: boolean;
  }
}

export default function Maps() {
  const { nowLatLng, setNowLatLng, wsRef, connectWs } = useContext(MapContext);

  useEffect(() => {
    // マーカーアイコンの問題を修正（デフォルトのアイコンを設定）
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    if (!nowLatLng) {
      // もし初マウント時にnowLatLngがnullだったら=dbに位置情報がない場合は、ブラウザの位置情報を取得してnowLatLngに設定する。
      navigator.geolocation.getCurrentPosition((position) => {
        setNowLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, (error) => {
        setNowLatLng({ lat: 35.681236, lng: 139.767125 });
      });
    }

    // ec2にws接続を行う。（内部でtry,catchでエラー処理はしている）
    connectWs();

    // ブラウザのタブ移動やウィンドウ最小化からの復帰時に、もしws接続が切断されていたら、再度接続を行う。
    // addEventListnerとremoveEventListnerで同じ関数への参照を使用しなくてはならないので予め定義。
    const handleVisibilityChange = () => {
      // wsRef.currentにwsが設定されており、そのws.readyStateがCLOSEDの場合はあり得ない。（oncloseでwsRef.current=nullが実行されるため）
      if (document.visibilityState === 'visible' && !wsRef.current) {
        connectWs();
      }
    };
    // イベントリスナー登録
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Mapコンポーネントアンマウント時≒ws接続不要になる
      // このコンポーネントで設定したイベントリスナー削除＋'現在の'ws接続を切断する。
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wsRef.current?.close();
      // oncloseでwsRef.current=nullが実行されるため、厳密には不要だが、明示的に.current=nullを書いておく。
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
