import UserNavbar from "@/app/components/UserNavbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import AdminNavbar from "@/app/components/AdminNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let isAdmin = session?.user?.role === "Admin";
  // isAdmin = false;

  console.log(session);
  return (
    <>
      {isAdmin ? (
        <AdminNavbar />
      ) : (
        <UserNavbar />
      )}
      {children}
    </>
  );
}
