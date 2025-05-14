import { createTable } from "@/libs/database";

export async function GET(request: Request) {
  await createTable();
  return new Response("OK");
}
