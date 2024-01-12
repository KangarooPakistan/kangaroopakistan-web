import { getServerSession } from "next-auth";
// import { authOptions } from "./api/auth/[...nextauth]/route";
import { authOptions } from "./lib/authOptions";
import User from "./user";
import { LoginButton, LogoutButton } from "./auth";
import Link from "next/link";

export default async function Home() {
  // const session = await getServerSession(authOptions);
  return (
    <main>
      <div>Hello World</div>
      <Link href="/login">Login</Link>
      <br />
      <Link href="/register">Register</Link>
    </main>
  );
}
