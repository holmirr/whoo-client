"use client";

import dynamic from "next/dynamic";
import { createContext, useEffect, useState } from "react";
import { MapContextType, Location, UserInfo } from "@/libs/types";
import UpdateButton from "./Button/Normal/UpdateButton";
import SettingButton from "./Button/SettingButton";
import MyPositionButton from "./Button/MyPositionButton";
import Setting from "./Setting/Setting";
import GetRouting from "./Button/Reservation/GetRouting";
import ReserveRouting from "./Button/Reservation/ReserveRouting";
import FriendsPositionButton from "./Button/FriendsPositionButton";
import FriendsList from "./FriendsList";
import Modes from "./Button/Modes";
import StopUpdateButton from "./Button/Normal/StopUpadte";
const MapComponent = dynamic(() => import("@/components/client/Map/Maps"), { ssr: false });
    
export const MapContext = createContext({} as MapContextType);

export default function DynamicMap({ users, _nowLatLng, profileImage, token }: { users: Location[], _nowLatLng: { lat: number, lng: number } | null, profileImage: string, token: string }) {
  const [isReflecting, setIsReflecting] = useState<boolean>(!!_nowLatLng);
  const [showFriendsList, setShowFriendsList] = useState(false);
  // distanceはm, defaultTimeは秒
  const [routeInfo, setRouteInfo] = useState<{ latlngs: { lat: number, lng: number }[], distance: number, defaultTime: number, time?: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [end, setEnd] = useState<{ lat: number, lng: number } | null>(null);
  const [showSetting, setShowSetting] = useState(false);
  const [mode, setMode] = useState<"normal" | "routing" >("normal");
  const [pinsLatLng, setPinsLatLng] = useState<{ lat: number, lng: number } | null>(null);
  const [nowLatLng, setNowLatLng] = useState<{ lat: number, lng: number } | null>(_nowLatLng);
  const [startDate, setStartDate] = useState<string>("");
  const [usersInfo, setUsersInfo] = useState<UserInfo[]>(() =>
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

  useEffect(() => {
    setPinsLatLng(null);
    setEnd(null);
    setRouteInfo(null);
    setIsRouting(false);
  }, [mode]);
  
  return (
    <MapContext.Provider value={{ token, pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage, batteryLevel, setBatteryLevel, showSetting, setShowSetting, showFriendsList, setShowFriendsList, isReflecting, setIsReflecting}}>
      <div className="md:w-3/5 md:mx-auto w-full h-10/10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/50 z-10000">
          {isReflecting ? "反映中" : "反映停止"}
        </div>
        <MapComponent />
        <SettingButton />
        <UpdateButton />
        <StopUpdateButton />
        <MyPositionButton />
        <Setting />
        <GetRouting />
        <ReserveRouting />
        <FriendsPositionButton />
        <FriendsList />
        <Modes /> 
      </div>
    </MapContext.Provider>
  )
}
