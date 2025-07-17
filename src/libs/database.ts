import postgres from "postgres";
import { whooUesr } from "./types";
const POSTGRES_URL = process.env.POSTGRES_URL!;

export const sql = postgres(POSTGRES_URL, { ssl: "require" });

export async function createTable() {
  await sql`CREATE TABLE IF NOT EXISTS whoo_users (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    latitude FLOAT,
    longitude FLOAT,
    stayed_at TIMESTAMP WITH TIME ZONE,
    battery_level FLOAT,
    no_exec BOOLEAN DEFAULT FALSE
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

export async function getIsNoExec(token: string): Promise<boolean | undefined> {
  const rows = await sql<{ no_exec: boolean }[]>`SELECT no_exec FROM whoo_users WHERE token = ${token}`;
  return rows[0]?.no_exec;
}

export async function getAllWhooUsers() {
  return await sql<whooUesr[]>`SELECT * FROM whoo_users`;
}
