import { sql } from "@/libs/database";

export async function GET(request: Request, { params }: { params: Promise< { tableName: string }> }) {
  // パスパラメータでtableNameを指定する。
  const { tableName } = await params;
  try {
    await sql`DROP TABLE IF EXISTS ${sql(tableName)}`;
    console.log("tableName ", tableName, " is deleted");
    return new Response("tableName " + tableName + " is deleted);
  } catch (error) {   
    console.error(error);
    return new Response("削除エラー", { status: 500 });
  }
}
