import { seedTable } from "@/libs/database";

export async function GET(request: Request) {
  try {
    // seedTable() では,whoo_usersのtableを削除してから、再度同名のtableを作成する。
    // columnsの内容や構成を変更する際に使用
    await seedTable();
    return new Response("OK");
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
}
