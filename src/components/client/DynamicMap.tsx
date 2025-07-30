"use client";

import dynamic from "next/dynamic";
import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { MapContextType, Location, UserInfo, RouteInfo, walkingResponse } from "@/libs/types";
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
  //useCallbackはuseMemoの関数Ver.useMemoは指定した関数が返す値を保持するが、useCallbackは関数そのものを保持する。
  //クロージャは関数定義時に初めて決定する。
  //useCallbackの依存配列に値を指定しないと、関数は初回マウント時のクロージャに縛られてしまい、再レンダリング後の最新のuseStateの値を参照できなくなる。これは「古いクロージャ (Stale Closure)」と呼ばれる典型的な問題。
  //なので、コールバック内で使用する変数（state)をuseCallbackの依存配列に指定し、その変数が変更されたら、新しいクロージャを生成するようにする。
  //setState関数への参照はレンダリングごとに変わらないので、明示的に指定しなくてもよい。
  const connectWs = useCallback(() => {
    try {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_SERVER}/?${new URLSearchParams({ token })}`);
      
      if (wsRef.current) {
        for (let i = 0; i < 10000; i++) {
          console.log(i);
        }
        wsRef.current.close();
      }
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
                setEnd(null);
                setFlyTarget(nowLatLng ? { lat: nowLatLng.lat, lng: nowLatLng.lng, id: 0 } : null);
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
  }, [nowLatLng]);

  useEffect(() => {
    setPinsLatLng(null);
    setEnd(null);
    setRouteInfo(null);
    setIsRouting(false);
  }, [mode]);

  return (
    <MapContext.Provider value={{ token, pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage, batteryLevel, setBatteryLevel, showSetting, setShowSetting, showFriendsList, setShowFriendsList, isReflecting, setIsReflecting, isWalking, setIsWalking, expiresDate, setExpiresDate, expiresDateInput, setExpiresDateInput, wsRef, stayedAt, setStayedAt, connectWs }}>
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
