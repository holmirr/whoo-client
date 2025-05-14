import { whooLoginAction } from "@/action";
import WhooLogin from "@/components/client/whooLogin";

export default function whooLogin() {
  return (
    <div className="flex flex-col gap-4 w-1/4 mx-auto">
      <h1>ログイン</h1>
      <WhooLogin />
    </div>
  );
}
