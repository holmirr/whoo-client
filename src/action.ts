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
export async function reserveRouteLatLngs(routeInfo: { latlngs: { lat: number, lng: number }[], distance: number, time: number, startDate?: string } | null, batteryLevel: number) {
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
    if (routeInfo.startDate === "now") {
      const reservationList = await getReservationList();
      if (reservationList.every((reservation) => validStartDate(routeInfo.startDate as string, routeInfo.time, reservation.scheduledTime, reservation.requiredTime))) {
        return { success: "startDate is now", error: null };
      } else {
        return { error: "予約時間が重複しています", success: null };
      }
    }
    console.log("routeInfo is reserved in serverAction", routeInfo);
    await saveRouteInfo({
      token: token,
      scheduledTime: new Date(routeInfo.startDate),
      requiredTime: routeInfo.time,
      latlngs: routeInfo.latlngs,
      distance: routeInfo.distance,
      batteryLevel: batteryLevel
    });
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