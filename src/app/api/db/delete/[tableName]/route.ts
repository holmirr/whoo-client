import { sql } from "@/libs/database";

export async function GET(request: Request, { params }: { params: Promise< { tableName: string }> }) {    
  const { tableName } = await params;
  console.log("tableName", tableName);
  try {
    await sql`DROP TABLE IF EXISTS ${sql(tableName)}`;
    return new Response("OK");
  } catch (error) {   
    // console.error(error);
    return new Response("削除エラー", { status: 500 });
  }
}
