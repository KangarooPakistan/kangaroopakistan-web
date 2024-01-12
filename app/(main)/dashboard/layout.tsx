import UserNavbar from "@/components/ui/UserNavbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminNavbar from "@/components/ui/AdminNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let isAdmin = session?.user?.role === "Admin";
  // isAdmin = false;

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      {children}
    </>
  );
}
