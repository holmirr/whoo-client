import MyFetch from "@holmirr/myfetch";
import { UpdateLocationData, LocationData, LoginResponse, MyInfoResponse } from "./types";

const { fetch, client } = MyFetch.create({
  defaultHeaders: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Accept": "application/json",
    "User-Agent": "app.whoo/0.33.3 iOS/18.3.2",
    "Accept-Language": "en-JP",
  },
});

export async function login(email: string, password: string) {
  const response = await fetch("https://www.wh00.ooo/api/email/login", {
    method: "POST",
    body: new URLSearchParams({ email, password }),
  });

  const data = await response.json() as LoginResponse;
  if (data.errors) {
    console.log(data.errors);
    throw new Error(data.errors);
  }
  return data.access_token;
}

export async function updateLocation({ token, latitude, longitude, speed, batteryLevel, stayedAt, isCharging = false, isActive = false, }:
  {
    token: string,
    latitude: number,
    longitude: number,
    speed: number,
    batteryLevel: number,
    stayedAt?: Date | null,
    isCharging?: boolean,
    isActive?: boolean
  }) {
  const data: UpdateLocationData = {
    "user_location[latitude]": latitude.toString(),
    "user_location[longitude]": longitude.toString(),
    "user_location[speed]": (speed / 3.6).toString(),
    "user_location[getting_location_type]": "5",
    "user_location[horizontal_accuracy]": "1",
    "app_state[active]": isActive ? "true" : "false",
    "user_battery[level]": batteryLevel.toString(),
    "user_battery[state]": isCharging ? "0" : "1",
    "user_device[os_info]": "ios",
    "user_device[os_version]": "0.0"
  };

  if (stayedAt) {
    data["user_location[stayed_at]"] = stayedAt.toLocaleString(
      "ja-JP", 
      {
      timeZone: "UTC",
    })
    .replace(/\//g, "-") + " +0000";
  }
  const response = await fetch("https://www.wh00.ooo/api/user/location", {
    method: "PATCH",
    body: new URLSearchParams(data),
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response.json() as Promise<UpdateLocationData>;
}

export async function getFriendsInfo(token: string) {
  const res = await fetch("https://www.wh00.ooo/api/locations", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const { locations } = await res.json() as LocationData;
  if (!locations) throw new Error("locations not found");
  return locations;
}

export async function getMyInfo(token: string) {
  const res = await fetch("https://www.wh00.ooo/api/my", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await res.json() as MyInfoResponse;
  if (data.errors) {
    console.log(data.errors);
    throw new Error(data.errors);
  }
  return data.user;
}