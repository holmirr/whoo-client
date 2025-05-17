"use client";

import dynamic from "next/dynamic";
import { createContext, useState } from "react";
import { getFriendsLatLng } from "@/action";
import { MapContextType, Location } from "@/libs/types";
import ModeButton from "./Button/ModeButton";
import UpdateButton from "./Button/Normal/UpdateButton";
import SettingButton from "./Button/SettingButton";
import MyPositionButton from "./Button/MyPositionButton";
import Setting from "./Setting/Setting";
import GetRouting from "./Button/Reservation/GetRouting";
import ReserveRouting from "./Button/Reservation/ReserveRouting";
const MapComponent = dynamic(() => import("@/components/client/Map/Maps"), { ssr: false });

export const MapContext = createContext({} as MapContextType);

export default function DynamicMap({ users, _nowLatLng, profileImage }: { users: Location[], _nowLatLng: { lat: number, lng: number } | null, profileImage: string }) {
  const [routeInfo, setRouteInfo] = useState<{ latlngs: { lat: number, lng: number }[], distance: number, time: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [start, setStart] = useState<{ lat: number, lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number, lng: number } | null>(null);
  const [showSetting, setShowSetting] = useState(false);
  const [mode, setMode] = useState<"normal" | "routing" >("normal");
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
  const [actualLatLng, setActualLatLng] = useState<{ lat: number, lng: number } | null>(null);
  

  

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
    <MapContext.Provider value={{ pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, start, setStart, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage, actualLatLng, setActualLatLng, batteryLevel, setBatteryLevel, showSetting, setShowSetting }}>
      <div className="md:w-3/5 md:mx-auto w-full h-10/10 relative">
        <MapComponent />
        <SettingButton />
        <UpdateButton />
        <MyPositionButton />
        <Setting />
        <GetRouting />
        <ReserveRouting />
      </div>
      {/* <div className="flex flex-row gap-2 justify-center">
        {
          usersInfo.map((user) => (
            <button key={user.name} onClick={() => updateFriendsLatLng(user.id)}>
              <img src={user.img} alt={user.name} width={64} height={64} />
            </button>
          ))
        }
      </div>
      */}
    </MapContext.Provider>
  )
}
