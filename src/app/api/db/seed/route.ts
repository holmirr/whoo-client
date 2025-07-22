import { seedTable } from "@/libs/database";

export async function GET(request: Request) {
  try {
    await seedTable();
    return new Response("OK");
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
}
