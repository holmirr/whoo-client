"use client";

import dynamic from "next/dynamic";
import { createContext, useState } from "react";
import { updatePinsLatLng, getFriendsLatLng, getRouteLatLngs } from "@/action";
import { MapContextType, Location } from "@/libs/types";
import ModeButton from "./ModeButton";
const MapComponent = dynamic(() => import("@/components/client/Maps"), { ssr: false });

export const MapContext = createContext({} as MapContextType);

export default function DynamicMap({ users, _nowLatLng, profileImage }: { users: Location[], _nowLatLng: { lat: number, lng: number } | null, profileImage: string }) {
  const [routeInfo, setRouteInfo] = useState<{ latlngs: { lat: number, lng: number }[], distance: number, time: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [start, setStart] = useState<{ lat: number, lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number, lng: number } | null>(null);
  const [mode, setMode] = useState<null | "routing" | "all">(null);
  const [pinsLatLng, setPinsLatLng] = useState<{ lat: number, lng: number } | null>(null);
  const [nowLatLng, setNowLatLng] = useState<{ lat: number, lng: number } | null>(_nowLatLng);
  const [usersInfo, setUsersInfo] = useState<{ lat: number, lng: number, stayed_at: string, name: string, img: string, id: number }[]>(
    users.map((user) => ({
      lat: parseFloat(user.latitude),
      lng: parseFloat(user.longitude),
      stayed_at: user.stayed_at,
      name: user.user.display_name,
      img: user.user.profile_image,
      id: user.user.id,
    }))
  );
  const [flyTarget, setFlyTarget] = useState<{ lat: number, lng: number, id: number } | null>(null);
  
  const handleUpdateLocation = async () => {
    if (!pinsLatLng) {
      alert("ピンの位置を選択してください");
      return;
    }
    try{
      await updatePinsLatLng({
        lat: pinsLatLng.lat,
        lng: pinsLatLng.lng,
      }, batteryLevel / 100);
      setNowLatLng({ lat: pinsLatLng.lat, lng: pinsLatLng.lng });
      setFlyTarget({ lat: pinsLatLng.lat, lng: pinsLatLng.lng, id: 0 });
      alert("位置情報を更新しました");
    } catch (error) {
      console.error(error);
      alert("位置情報の更新に失敗しました");
    }
  }

  const updateFriendsLatLng = async (id: number) => {
    try {
      const users = await getFriendsLatLng();
      setUsersInfo(users.map((user) => ({
        lat: parseFloat(user.latitude),
        lng: parseFloat(user.longitude),
        name: user.user.display_name,
        img: user.user.profile_image,
        id: user.user.id,
        stayed_at: user.stayed_at,
      })));
      const targetUser = users.find(user => user.user.id === id);
      if (targetUser) {
        setFlyTarget({ lat: parseFloat(targetUser.latitude), lng: parseFloat(targetUser.longitude), id: targetUser.user.id });
      } else {
        throw new Error("ユーザーが見つかりません");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <MapContext.Provider value={{ pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, start, setStart, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage }}>
      <MapComponent />
      <div className="flex flex-row gap-2 justify-center">
        <div>
          <p>バッテリー残量</p>
          <input type="number" value={batteryLevel} onChange={(e) => setBatteryLevel(Number(e.target.value))} 
          className="w-16"
          min={0}
          max={100}
          />
        </div>
        <button
          onClick={handleUpdateLocation}
          disabled={!pinsLatLng}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
            !pinsLatLng
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600 cursor-pointer'
          }`}
        >
          位置情報更新
        </button>
        
        {
          usersInfo.map((user) => (
            <button key={user.name} onClick={() => updateFriendsLatLng(user.id)}>
              <img src={user.img} alt={user.name} width={64} height={64} />
            </button>
          ))
        }
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <ModeButton onClick={() => setMode("routing")} disabled={mode === "routing"}>ルーティングモード</ModeButton>
        <ModeButton onClick={() => setMode(null)} disabled={mode === null}>通常モード</ModeButton>
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <button 
        onClick={() => setIsRouting(true)} 
        disabled={!start || !end || mode !== "routing" || isRouting}
      className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
        !start || !end || mode !== "routing" || isRouting
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-blue-600 cursor-pointer'
        }`}
        >経路を表示</button>
        <button 
        onClick={() => getRouteLatLngs(routeInfo)} 
        className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
          routeInfo === null
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-600 cursor-pointer'
        }`}
        disabled={routeInfo === null}
        >
          経路を取得</button>
      </div>
    </MapContext.Provider>
  )
}
