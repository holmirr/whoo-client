"use server";

import { getFriendsInfo, updateLocation } from "@/libs/whooClient";
import { signIn, auth  } from "@/auth/auth";
import { redirect } from "next/navigation";
import { saveWhooUser } from "@/libs/database";

export async function updatePinsLatLng(props: {lat: number, lng: number} | null, batteryLevel: number){
  if(!props){
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

export async function getRouteLatLngs(routeInfo: { latlngs: { lat: number, lng: number }[], distance: number, time: number } | null) {
  console.log(routeInfo);
  console.log(routeInfo?.latlngs.length)
}

export async function whooLoginAction(prevState: any, formData: FormData) {
  try{
    const email = formData.get("email");
    const password = formData.get("password");
    await signIn("credentials", { email, password, site: "whoo",redirect: false });
    redirect("/whoo")
  }
  catch(error){
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.log(error);
    return { error: "ログインに失敗しました" };
  }
}

