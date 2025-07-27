"use client";

import dynamic from "next/dynamic";
import { createContext, useEffect, useRef, useState } from "react";
import { MapContextType, Location, UserInfo, RouteInfo } from "@/libs/types";
import UpdateButton from "./Button/Normal/UpdateButton";
import SettingButton from "./Button/SettingButton";
import MyPositionButton from "./Button/MyPositionButton";
import Setting from "./Setting/Setting";
import GetRouting from "./Button/Reservation/GetRouting";
import ReserveRouting from "./Button/Reservation/ReserveRouting";
import FriendsPositionButton from "./Button/FriendsPositionButton";
import FriendsList from "./FriendsList";
import Modes from "./Button/Modes";
import StopReflectButton from "./Button/Normal/StopReflect";
import ReflectNotification from "./ReflectNotification";
import StopButton from "./Button/Reservation/StopButton";
const MapComponent = dynamic(() => import("@/components/client/Map/Maps"), { ssr: false });

export const MapContext = createContext({} as MapContextType);

export default function DynamicMap({ users, _nowLatLng, profileImage, _expiresDate, token, _stayedAt }: { users: Location[], _nowLatLng: { lat: number, lng: number } | null, profileImage: string, _expiresDate: Date | null, token: string, _stayedAt: Date | null }) {
  const [isReflecting, setIsReflecting] = useState<boolean>(!!_nowLatLng);
  const [showFriendsList, setShowFriendsList] = useState(false);
  // distanceはm, defaultTimeは秒
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [expiresDate, setExpiresDate] = useState<Date | null>(_expiresDate);
  const [expiresDateInput, setExpiresDateInput] = useState<Date | null>(_expiresDate);
  const [end, setEnd] = useState<{ lat: number, lng: number } | null>(null);
  const [showSetting, setShowSetting] = useState(false);
  const [mode, setMode] = useState<"normal" | "routing">("normal");
  const [pinsLatLng, setPinsLatLng] = useState<{ lat: number, lng: number } | null>(null);
  const [nowLatLng, setNowLatLng] = useState<{ lat: number, lng: number } | null>(_nowLatLng);
  const [stayedAt, setStayedAt] = useState<Date | null>(_stayedAt);
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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setPinsLatLng(null);
    setEnd(null);
    setRouteInfo(null);
    setIsRouting(false);
  }, [mode]);

  return (
    <MapContext.Provider value={{ token, pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage, batteryLevel, setBatteryLevel, showSetting, setShowSetting, showFriendsList, setShowFriendsList, isReflecting, setIsReflecting, isWalking, setIsWalking, expiresDate, setExpiresDate, expiresDateInput, setExpiresDateInput, wsRef, stayedAt, setStayedAt }}>
      <div className="md:w-3/5 md:mx-auto w-full h-10/10 relative">
        <MapComponent />
        <ReflectNotification />
        <>
          <Modes />
          <SettingButton />
          <FriendsPositionButton />
          <MyPositionButton />
        </>
        <>
          <UpdateButton />
          <StopReflectButton />
        </>
        <>
          <GetRouting />
          <ReserveRouting />
          <StopButton />
        </>
        <>
          <Setting />
          <FriendsList />
        </>
      </div>
    </MapContext.Provider>
  )
}
