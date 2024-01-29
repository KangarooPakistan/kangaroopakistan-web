import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";
import User from "./user";
import { LoginButton, LogoutButton } from "./auth";
import Link from "next/link";
import Login from "./(main)/login/page";

export default async function Home() {
  // const session = await getServerSession(authOptions);
  return (
    <main className="px-4 py-4">
      <Login />
    </main>
  );
}
