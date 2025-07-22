"use client"

import { whooLoginAction } from "@/action";
import { useActionState, useState } from "react";

export default function WhooLogin() {
  const [formState, formAction, isPending] = useActionState(whooLoginAction, null);
  const [formData, setFormData] = useState<{ email: string, password: string }>({
    email: "",
    password: ""
  })
  return (
    <>
      <form className="flex flex-col gap-4" action={formAction}>
          <input type="text" placeholder="メールアドレス" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="パスワード" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        {formState?.error && <p className="text-red-500">{formState.error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:cursor-pointer disabled:cursor-not-allowed" disabled={isPending}>
          {isPending ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </>
  );
}