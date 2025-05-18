"use client";

import dynamic from "next/dynamic";
import { createContext, useState } from "react";
import { getFriendsLatLng } from "@/action";
import { MapContextType, Location } from "@/libs/types";
import UpdateButton from "./Button/Normal/UpdateButton";
import SettingButton from "./Button/SettingButton";
import MyPositionButton from "./Button/MyPositionButton";
import Setting from "./Setting/Setting";
import GetRouting from "./Button/Reservation/GetRouting";
import ReserveRouting from "./Button/Reservation/ReserveRouting";
import FriendsPositionButton from "./Button/FriendsPositionButton";
import FriendsList from "./FriendsList";
const MapComponent = dynamic(() => import("@/components/client/Map/Maps"), { ssr: false });
    
export const MapContext = createContext({} as MapContextType);

export default function DynamicMap({ users, _nowLatLng, profileImage }: { users: Location[], _nowLatLng: { lat: number, lng: number } | null, profileImage: string }) {
  const [showFriendsList, setShowFriendsList] = useState(false);
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
  
  return (
    <MapContext.Provider value={{ pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, start, setStart, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage, actualLatLng, setActualLatLng, batteryLevel, setBatteryLevel, showSetting, setShowSetting, showFriendsList, setShowFriendsList }}>
      <div className="md:w-3/5 md:mx-auto w-full h-10/10 relative">
        <MapComponent />
        <SettingButton />
        <UpdateButton />
        <MyPositionButton />
        <Setting />
        <GetRouting />
        <ReserveRouting />
        <FriendsPositionButton />
        <FriendsList />
      </div>
      {/* <div className="flex flex-row gap-2 justify-center">

      </div>
      */}
    </MapContext.Provider>
  )
}
