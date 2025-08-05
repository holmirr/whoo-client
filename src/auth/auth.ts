import { authConfig } from "@/auth/auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { login } from "@/libs/whooClient";

// NextAuth関数は指定されたauthConfigに基づいた関数群を返す
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // クレデンシャルプロバイダー
    Credentials({
      // signIn("credentials", { email, password, site, redirect: false })などで呼ばれる。
      // credentialsを指定してsignIn関数を実行すると内部でauthorize関数が呼ばれる。
      // 引数のcredentialsは、signIn関数の第２引数に指定したオブジェクトからredirectやcallbackUrlなどの予約プロパティを除外したオブジェクト。
      // authorize内でnull(falsty)を返すと、signIn関数はAuthError(.type="CredentialsSignin")を投げる。(クライアント用のsignIn関数はエラーオブジェクトを返す)
      // ※authorize()内のエラーはすべてAuthError(.type="CredentialsSignin")になる。
      // authorize内でtrulyな値を返すと、signIn関数の戻り値はundefinedになる。（redirect:trueならredirectされ、falseなら単にundefinedを返す）(クライアント用のsignIn関数はsuccess:trueを返す)
      // authorize内のtrulyな戻り値は、jwt()コールバックのuserオブジェクトに渡され、cookieのjwtにセットされる。
      // つまり、全体の流れはsignIn()→authorize()→jwt()→set-cookieでjwtセット→redirectレスポンス(redirect:true) or サーバーアクションレスポンス(redirect: false)
      async authorize(credentials) {
        // フォームのバリデーションにzodを用いる。
        // zodの基本的な使い方は、schema = z.[type]()でスキーマを定義して、schema.parse(targetVal)でバリデーションを行う。
        // z.[type]()はただの型チェックだが、メソッドチェーンでさらに細かいバリデーションを行うことができる。
        // メソッドチェーンの例：z.string().min(8).max(100)
        // メソッドチェーンの例：z.string().min(8).max(100).email()
        // parse(targetVal)は成功時はtargetValをそのまま返し、失敗時はエラーを投げる。
        // safeParse(targetVal)は成功時は{ success: true, data: targetVal }を返し、失敗時は{ success: false, error: エラー }を返す。
        // 今回の場合、z.object()でobjectであることを示し、その引数に具体的なプロパティを指定する。
        // プロパティもまたz.[type]()でスキーマとして指定する。
        const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8), site: z.string() })
        // 定義したスキーマを用いて、元のデータをparseする。
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        // 戻り値が{ success: false, error: エラー }の場合、authorize()でnullを返し、signIn()でAuthErrorを投げる。
        if (!parsedCredentials.success) {
          console.log(parsedCredentials.error.flatten().fieldErrors);
          return null;
        }

        // バリデーションに成功した場合、データを取得する。
        const { email, password, site } = parsedCredentials.data;
        // もともとwhoo以外にもsignInできるサイトを追加する予定だったので、siteの値によって場合分けを実装している。
        if (site === "whoo") {
          // 入力された情報を使用してwhooのAPIにリクエストを送り、tokenを取得する。
          // login()ではエラーハンドリングしておらず、呼び出し側のauthorize()でもしていない
          // もしログインに失敗したらエラーを投げるので、その場合はsignIn()がAuthErrorを投げる。
          const token = await login(email, password);
          // ログインに成功した場合、tokenを返す。
          // このtokenはjwt()コールバックのuserオブジェクトに渡され、cookieのjwtにセットされる。
          return {
            whoo: {
              token
            }
          };
        }
        // どのサイトにも一致しなければnullを返す。→signIn()でAuthErrorを投げる。
        return null;
      }
    })
  ],
});
