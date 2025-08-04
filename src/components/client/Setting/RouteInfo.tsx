"use client"

import { mTokm } from "@/libs/utils";
import { useContext, useMemo } from "react";
import { MapContext } from "../DynamicMap";

export default function RouteInfo() {
  const { routeInfo } = useContext(MapContext);

  // .distanceはm, timeは秒
  // requiredTime変化→routeInfo.time更新→speed再計算
  const speed = useMemo(() => {
    // speedがundefinedの場合はレンダリングしない
    if (!routeInfo) return undefined;
    // routeInfo.timeがundefinedの場合（routeInfo.timeはRequiredTimeのuseEffectで更新されるのでRequiredTime初マウント時に限りundefinedになり得る）
    const time = routeInfo.time ?? 0;
    // RequiredTimeが未設定 or RequiredTime初マウント時≒routeInfo.timeがundefinedの場合は速度自体を0と表示
    if (time === 0) return 0;
    // 時速を計算 km/h
    let speed = (routeInfo.distance / 1000) / (time / 3600);
    // もし時速が１未満（例：0.432km/h)の場合は小数点以下１桁まで表示
    if (speed < 1 && speed > 0) {
      speed = Number(speed.toFixed(1));
    // 1km/h以上の場合は小数点以下を切り捨て
    } else {
      speed = Math.floor(speed);
    }
    return speed;
  }, [routeInfo]);

  return routeInfo?.distance && (speed !== undefined) && (
    <div>
      <h2>ルート情報</h2>
      <p>距離: {mTokm(routeInfo.distance)}</p>
      <p>時速: {speed}km/h</p>
    </div>
  )
}