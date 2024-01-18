import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";
import User from "./user";
import { LoginButton, LogoutButton } from "./auth";
import Link from "next/link";

export default async function Home() {
  // const session = await getServerSession(authOptions);
  return (
    <main className="px-4 py-4">
      <Link
        className="m-3 d-block bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2  sm:h-9 sm:rounded-md sm:px-3  lg:h-11 lg:rounded-md lg:px-8"
        href="/login"
      >
        Login
      </Link>
      <Link
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 sm:h-9 sm:rounded-md sm:px-3  lg:h-11 lg:rounded-md lg:px-8"
        href="/register"
      >
        Register
      </Link>
    </main>
  );
}
