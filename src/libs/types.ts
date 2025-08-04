export type UpdateLocationData = {
  "user_location[latitude]": string,
  "user_location[longitude]": string,
  "user_location[speed]": string,
  "user_location[getting_location_type]": string,
  "user_location[horizontal_accuracy]": string,
  "user_location[stayed_at]"?: string,
  "app_state[active]": string,
  "user_battery[level]": string,
  "user_battery[state]": string,
  "user_device[os_info]": string,
  "user_device[os_version]": string,
}

export type RouteInfo = {
  latlngs: { lat: number, lng: number }[],
  distance: number,
  defaultTime: number,
  time?: number
}

export type MapContextType = {
  token: string,
  pinsLatLng: { lat: number, lng: number } | null,
  setPinsLatLng: React.Dispatch<React.SetStateAction<{ lat: number, lng: number } | null>>,
  nowLatLng: { lat: number, lng: number } | null,
  setNowLatLng: React.Dispatch<React.SetStateAction<{ lat: number, lng: number } | null>>,
  usersInfo: { lat: number, lng: number, stayed_at: string, name: string, img: string, id: number }[],
  setUsersInfo: React.Dispatch<React.SetStateAction<UserInfo[]>>,
  flyTarget: number | null,
  setFlyTarget: React.Dispatch<React.SetStateAction<number | null>>,
  mode: "normal" | "routing",
  setMode: React.Dispatch<React.SetStateAction<"normal" | "routing">>,
  end: { lat: number, lng: number } | null,
  setEnd: React.Dispatch<React.SetStateAction<{ lat: number, lng: number } | null>>,
  isRouting: boolean,
  setIsRouting: React.Dispatch<React.SetStateAction<boolean>>,
  routeInfo: { latlngs: { lat: number, lng: number }[], distance: number, defaultTime: number, time?: number } | null,
  setRouteInfo: React.Dispatch<React.SetStateAction<{ latlngs: { lat: number, lng: number }[], distance: number, defaultTime: number, time?: number } | null>>,
  profileImage: string,
  batteryLevel: number,
  setBatteryLevel: React.Dispatch<React.SetStateAction<number>>,
  showSetting: boolean,
  setShowSetting: React.Dispatch<React.SetStateAction<boolean>>,
  showFriendsList: boolean,
  setShowFriendsList: React.Dispatch<React.SetStateAction<boolean>>,
  isReflecting: boolean,
  setIsReflecting: React.Dispatch<React.SetStateAction<boolean>>,
  isWalking: boolean,
  setIsWalking: React.Dispatch<React.SetStateAction<boolean>>,
  expiresDate: Date | null,
  setExpiresDate: React.Dispatch<React.SetStateAction<Date | null>>,
  expiresDateInput: Date | null,
  setExpiresDateInput: React.Dispatch<React.SetStateAction<Date | null>>,
  wsRef: React.RefObject<WebSocket | null>,
  stayedAt: Date | null,
  setStayedAt: React.Dispatch<React.SetStateAction<Date | null>>,
  connectWs: () => void,
}     

export interface LocationData {
  locations: Location[];
}

// stayed_atはyyyy-mm-dd hh:mm:ssの形式である(UTC)
export interface Location {
  latitude: string;
  longitude: string;
  stayed_at: string;
  speed: number;
  horizontal_accuracy: string | number;
  battery: Battery;
  device: Device;
  spot: Spot | null;
  user: User;
  sharing_type: number;
  updated_at: string;
  actual_updated_at: string;
}

interface Battery {
  level: number;
  state: number;
}

interface Device {
  os_info: number;
  os_version: string;
}

interface Spot {
  id: number;
  latitude: number;
  longitude: number;
  spot_type: number;
  name: string;
}

interface User {
  id: number;
  uid: number;
  username: string;
  display_name: string;
  profile_image: string;
  introduction: string | null;
  online: boolean;
  user_type: string;
  updated_at: string;
}

type AppIcon = {
  id: number;
  icon_type: string;
  friends_condition: number | null;
  login_days_condition: number | null;
};

type UserAppIcon = {
  id: number;
  app_icon: AppIcon;
  icon_state: "get" | "lock";
  check_conditions: boolean;
};

export type MyInfo = {
  id: number;
  uid: number;
  footprint_uuid: string;
  username: string;
  display_name: string;
  birthday: string;
  profile_image: string;
  introduction: string | null;
  online: boolean;
  login_days: number;
  max_login_days: number;
  private_mode: boolean;
  whoo_supporter: boolean;
  allow_recommended_users: boolean;
  watch_count: number;
  watch_user_count: number;
  phone_number: string | null;
  country_code: string;
  pop_points: number;
  world_rank: number | null;
  friend_count: number;
  time_with: number;
  your_world_disclosure_scope: number;
  created_at: string;
  friend_last_created_at: string;
  user_app_icons: UserAppIcon[];
};

export type MyInfoResponse = {
  user: MyInfo;
  errors: null | any;
};

export type LoginResponseUser = {
  id: number;
  uid: number;
  footprint_uuid: string;
  username: string;
  display_name: string;
  birthday: string;
  profile_image: string;
  introduction: string | null;
  online: boolean;
  private_mode: boolean;
  your_world_disclosure_scope: number;
  user_type: string;
  friend_count: number;
  created_at: string;
};

export type LoginResponse = {
  user: LoginResponseUser;
  access_token: string;
  errors: null | any;
};

export type whooUesr = {
  token: string,
  latitude: number | null,
  longitude: number | null,
  stayed_at: Date | null,
  battery_level: number | null,
  no_exec: boolean,
  expires: Date | null
}

export type UserInfo = {
  lat: number,
  lng: number,
  stayed_at: string,
  name: string,
  img: string,
  id: number
}

export type walkingResponse = {
  type:"walking"
  data: boolean,
} | {
  type: "error" | "success" | "stopped",
  finish: boolean,
  data: string | number ,
  detail: string,
} | {
  type: "location",
  finish: boolean,
  data: { lat: number, lng: number, id: number },
  detail: string,
}