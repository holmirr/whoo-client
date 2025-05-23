import postgres from "postgres";
import { whooUesr, dbRouteInfo } from "./types";
const POSTGRES_URL = "postgresql://postgres:Koto-0524@database-1.c1ukumcekom4.ap-northeast-1.rds.amazonaws.com:5432/gpshacking";

export const sql = postgres(POSTGRES_URL, { ssl: "require" });

export async function createTable() {
  await sql`CREATE TABLE IF NOT EXISTS whoo_users (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    latitude FLOAT,
    longitude FLOAT,
    stayed_at TIMESTAMP WITH TIME ZONE,
    battery_level FLOAT
  )`;

  // required_timeは秒数
  // distanceはメートル
  await sql`CREATE TABLE IF NOT EXISTS route_info (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    required_time FLOAT NOT NULL,
    latlngs JSONB NOT NULL,
    distance FLOAT NOT NULL,
    battery_level FLOAT NOT NULL
  )`;
}

export async function saveWhooUser({ token, lat, lng, stayedAt, batteryLevel }:
  {
    token: string,
    lat?: number,
    lng?: number,
    stayedAt?: Date,
    batteryLevel?: number
  }) {
  await sql`
    INSERT INTO whoo_users (token, latitude, longitude, stayed_at, battery_level)
    VALUES (${token}, ${lat ?? null}, ${lng ?? null}, ${stayedAt ?? null}, ${batteryLevel ?? null})
    ON CONFLICT (token)
    DO UPDATE SET
      latitude = COALESCE(EXCLUDED.latitude, whoo_users.latitude),
      longitude = COALESCE(EXCLUDED.longitude, whoo_users.longitude), 
      stayed_at = COALESCE(EXCLUDED.stayed_at, whoo_users.stayed_at),
      battery_level = COALESCE(EXCLUDED.battery_level, whoo_users.battery_level)
  `;
}

export async function getWhooUser(token: string): Promise<whooUesr | undefined> {
  const rows = await sql<whooUesr[]>`SELECT * FROM whoo_users WHERE token = ${token}`;
  return rows[0];
}

export async function getAllWhooUsers() {
  return await sql<whooUesr[]>`SELECT * FROM whoo_users`;
}


export async function saveRouteInfo({ token, scheduledTime, requiredTime, latlngs, distance, batteryLevel }:
  {
    token: string,
    scheduledTime: Date,
    requiredTime: number,
    latlngs: { lat: number, lng: number }[],
    distance: number,
    batteryLevel: number
  }) {
  const sessionId = Math.random().toString(36).substring(2, 15);
  await sql`
    INSERT INTO route_info (token, session_id, scheduled_time, required_time, latlngs, distance, battery_level)
    VALUES (${token}, ${sessionId}, ${scheduledTime}, ${requiredTime}, ${JSON.stringify(latlngs)}, ${distance}, ${batteryLevel})
  `;
}

export async function updateRouteInfo({ token, session_id, scheduled_time, required_time, latlngs, distance, battery_level }: dbRouteInfo) {
  await sql`
    UPDATE route_info SET 
    scheduled_time = ${scheduled_time}, 
    required_time = ${required_time}, 
    latlngs = ${JSON.stringify(latlngs)}, 
    distance = ${distance},
    battery_level = ${battery_level}
    WHERE token = ${token} AND session_id = ${session_id}
  `;
}

export async function getRouteInfo(token: string) {
  return await sql<dbRouteInfo[]>`SELECT * FROM route_info WHERE token = ${token} ORDER BY scheduled_time ASC`;
}