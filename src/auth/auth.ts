import { authConfig } from "@/auth/auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { login } from "@/libs/whooClient";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8), site: z.string() })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log(parsedCredentials.error);
          return null;
        }
        const { email, password, site } = parsedCredentials.data;
        if (site === "whoo") {
          const token = await login(email, password);
          return {
            whoo: {
              token
            }
          };
        }
        return null;
      }
    })
  ],
});
