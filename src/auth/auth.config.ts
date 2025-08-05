import { NextAuthConfig, User, Session } from "next-auth";
import { AdapterUser, AdapterSession } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";

// sessionオブジェクトに任意のプロパティを追加するための型定義
// interfaceをdeclareで追加すると、元のファイルで定義されているinterfaceと合体させる（上書きではない）
// ちなみにJWT型はPartial<Record<string, unknown>>なので、token.newpropとするために新たに型定義する必要はない
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

// 認証プロパイダーを定義する前のauthConfingの雛形を定義
export const authConfig = {
  callbacks: {
    // middlewareで認証済みかをチェックするための関数
    // jwt→session→authorizedの順番で呼ばれる。（sessionの戻り値がauthオブジェクトになる）
    authorized({ auth, request }) {
      // sessionが存在し、そのプロパティにkey:whooのオブジェクトが存在するか、そしてそのオブジェクトにkey:tokenが存在するかを確認
      // これがログインの証となっている。
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
    // signIn時→userはプロバイダーによって格納された情報、tokenはそれらの情報から基本的なプロパティ(nameやemailを事前に追加したほぼプレーンなtokenオブジェクト
    // そのほかの呼び出し(useSessionやauth()) → userはundefined, tokenはcookieから取り出したjwtオブジェクトの情報
    jwt({ token, user }: { token: JWT, user: User | AdapterUser }) {
      // もし、userが存在し、userにwhooプロパティが存在すれば、whooによるログインなので、対応するjwtを返す。
      if (user?.whoo) {
        token.whoo = {
          token: user.whoo.token,
        };
      }
      return token;
    },
    // session引数は基本的な情報があらかじめtokenから格納されたオブジェクト
    // tokenはjwt()の戻り値
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
// satisfiesは型情報をチェックし、NextAuthConfigという型情報の要件を満たしていれば、エラーを投げない
// そして、コロンによる型注釈と違い、型情報を強制しない！
// A : B = C → Aの型をBに強制し、CがBを満たさなければエラー
// A satisfies B = C → Aの型は実際に格納されるC（型推測）だが、CがBを満たさなければエラーになる。
