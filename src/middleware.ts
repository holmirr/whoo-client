import NextAuth from "next-auth";
import { authConfig } from "@/auth/auth.config";

export default NextAuth(authConfig).auth;
export const config = {
  matcher: ["/whoo", "/whoo/login"],
}
