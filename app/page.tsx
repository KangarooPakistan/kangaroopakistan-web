import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";
import { redirect } from "next/navigation";
import LoginWrapper from "./components/LoginWrapper";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is already logged in, redirect to dashboard immediately (server-side)
  if (session) {
    redirect("/dashboard");
  }
  
  // If not logged in, show login page
  return (
    <main className="px-4 py-4">
      <LoginWrapper />
    </main>
  );
}
