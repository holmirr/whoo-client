"use server";

import { getFriendsInfo, updateLocation } from "@/libs/whooClient";
import { signIn, auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { saveWhooUser, getIsNoExec, deleteLatLng } from "@/libs/database";

export async function updatePinsLatLng(props: { lat: number, lng: number } | null, batteryLevel: number, expiresDate: Date | null): Promise<{success: string, error: null} | {success: null, error: string}> {
  if (!props) {
    return {
      success: null,
      error: "pinが設定されていません"
    }
  }
  const session = await auth();
  if (!session?.whoo) {
    redirect("/whoo/login");
  }
  const isNoExec = await getIsNoExec(session.whoo.token);
  if (isNoExec) {
    return {
      success: null,
      error: "移動中は位置情報を更新できません"
    }
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
    expiresDate: expiresDate,
    no_exec: false
  });
  return {
    success: "位置情報を更新しました",
    error: null
  };
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
export async function reserveRouteLatLngs(encryptedToken: string, routeInfo: { latlngs: { lat: number, lng: number }[], distance: number, defaultTime: number, time?: number } | null, batteryLevel: number, expiresDate: Date | null) {
  try {
    if (!routeInfo) {
      throw new Error("routeInfoがnullです");
    } else if (!routeInfo.time) {
      throw new Error("timeがnullです");
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
        speed,
        expiresDate
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

export async function deleteLatLngAction() {
  const session = await auth();
  if (!session?.whoo) {
    redirect("/whoo/login");
  }
  await deleteLatLng(session.whoo.token);
}