"use server";

import { getFriendsInfo, updateLocation } from "@/libs/whooClient";
import { signIn, auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { saveWhooUser, saveRouteInfo, getRouteInfo, deleteRouteInfo } from "@/libs/database";
import { validStartDate } from "@/libs/utils";

export async function updatePinsLatLng(props: { lat: number, lng: number } | null, batteryLevel: number) {
  if (!props) {
    console.log("pinが設定されていません")
    return false;
  }
  const session = await auth();
  if (!session?.whoo) {
    redirect("/whoo/login");
  }
  await updateLocation({
    token: session.whoo.token,
    latitude: props.lat,
    longitude: props.lng,
    speed: 0,
    batteryLevel: batteryLevel,
    stayedAt: new Date()
  });
  await saveWhooUser({
    token: session.whoo.token,
    lat: props.lat,
    lng: props.lng,
    stayedAt: new Date(),
    batteryLevel: batteryLevel,
  });
}

export async function getFriendsLatLng() {
  const session = await auth();
  if (!session?.whoo) {
    redirect("/whoo/login");
  }
  const users = await getFriendsInfo(session.whoo.token);
  return users;
}

// distanceはm, timeは秒, startDateはyyyy-mm-ddThh:mmの形式である(local-timezone)
export async function reserveRouteLatLngs(encryptedToken: string, routeInfo: { latlngs: { lat: number, lng: number }[], distance: number, time: number, startDate?: string } | null, batteryLevel: number) {
  try {
    if (!routeInfo) {
      throw new Error("routeInfoがnullです");
    }
    if (!routeInfo.startDate) {
      throw new Error("startDateがnullです");
    }
    const token = (await auth())?.whoo?.token;
    if (!token) {
      redirect("/whoo/login");
    }
    const interval = routeInfo.time / routeInfo.latlngs.length;
    const speed = (routeInfo.distance / 1000) / (routeInfo.time / 3600);
    const res = await fetch(`${process.env.API_SERVER}/api/execRoutes?${new URLSearchParams({token: encryptedToken})}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        routes: routeInfo.latlngs,
        interval,
        batteryLevel,
        speed
      })
    })
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return { success: "ルート情報の予約に成功しました", error: null };
  }
  catch (error) {
    console.log(error);
    return { error: "ルート情報の予約に失敗しました", success: null };
  }
}

export async function whooLoginAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    await signIn("credentials", { email, password, site: "whoo", redirect: false });
    redirect("/whoo")
  }
  catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.log(error);
    return { error: "ログインに失敗しました" };
  }
}

export async function getReservationList() {
  const session = await auth();
  if (!session?.whoo) {
    redirect("/whoo/login");
  }
  const reservationList = await getRouteInfo(session.whoo.token);
  return reservationList.map((resInfo) => {
    return {
      sessionId: resInfo.session_id,
      scheduledTime: resInfo.scheduled_time,
      requiredTime: resInfo.required_time,
      distance: resInfo.distance,
      batteryLevel: resInfo.battery_level
    }
  })
}

export async function deleteReservation(session_id: string) {
  const session = await auth();
  if (!session?.whoo) {
    redirect("/whoo/login");
  }
  await deleteRouteInfo(session_id);
}