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

export type MapContextType = {
  token: string,
  pinsLatLng: { lat: number, lng: number } | null,
  setPinsLatLng: (value: { lat: number, lng: number } | null) => void,
  nowLatLng: { lat: number, lng: number } | null,
  setNowLatLng: (value: { lat: number, lng: number } | null) => void,
  usersInfo: { lat: number, lng: number, stayed_at: string, name: string, img: string, id: number }[],
  setUsersInfo: (value: { lat: number, lng: number, stayed_at: string, name: string, img: string, id: number }[]) => void,
  flyTarget: { lat: number, lng: number, id: number } | null,
  setFlyTarget: (value: { lat: number, lng: number, id: number } | null) => void,
  mode: "normal" | "routing",
  setMode: (value: "normal" | "routing") => void,
  end: { lat: number, lng: number } | null,
  setEnd: (value: { lat: number, lng: number } | null) => void,
  isRouting: boolean,
  setIsRouting: (value: boolean) => void,
  routeInfo: { latlngs: { lat: number, lng: number }[], distance: number, defaultTime: number, time?: number } | null,
  setRouteInfo: (value: { latlngs: { lat: number, lng: number }[], distance: number, defaultTime: number, time?: number } | null) => void,
  profileImage: string,
  batteryLevel: number,
  setBatteryLevel: (value: number) => void,
  showSetting: boolean,
  setShowSetting: (value: boolean) => void,
  showFriendsList: boolean,
  setShowFriendsList: (value: boolean) => void,
  isReflecting: boolean,
  setIsReflecting: (value: boolean) => void,
  expiresDate: Date | null,
  setExpiresDate: (value: Date | null) => void,
  expiresDateInput: Date | null,
  setExpiresDateInput: (value: Date | null) => void,
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