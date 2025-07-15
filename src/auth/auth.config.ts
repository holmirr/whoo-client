import { NextAuthConfig, User, Session } from "next-auth";
import { AdapterUser, AdapterSession } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    whoo: {
      token: string;
    }
  }
  interface User {
    whoo: {
      token: string;
    }
  }
}

export const authConfig = {
  callbacks: {
    authorized({ auth, request }) {
      const whooLoggedIn = !!auth?.whoo?.token;
      if (request.nextUrl.pathname === "/whoo") {
        if (whooLoggedIn) return true;
        return Response.redirect(new URL("/whoo/login", request.url));
      } else if (request.nextUrl.pathname === "/whoo/login") {
        if (whooLoggedIn) return Response.redirect(new URL("/whoo", request.url));
        return true;
      }
      return true;
    },
    jwt({ token, user }: { token: JWT, user: User | AdapterUser }) {
      if (user?.whoo) {
        token.whoo = {
          token: user.whoo.token,
        };
      }
      return token;
    },
    session({ session, token }: {
      session: {
        user: AdapterUser;
      } & AdapterSession & Session, 
      token: JWT
    }) {
      if (token.whoo) {
        session.whoo = token.whoo as { token: string };
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
