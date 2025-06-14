import Link from "next/link";

export default function Home() {
    return (
    <div className="pt-10 flex flex-col items-center justify-center gap-4 text-xl text-blue-500">
      <Link href="/whoo">Whoo</Link>
      <Link href="/whoo/login">Whoo Login</Link>
    </div>
  )
}