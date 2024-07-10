"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { usePathname } from "next/navigation";

import { useEffect } from "react";

const AuthRedirect = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    // if (status === "loading") return; // Do nothing while loading
    if (status === "authenticated" && pathname === "/") {
      router.replace("/dashboard"); // Redirect to dashboard if authenticated and on login page
    } else if (
      status === "unauthenticated" &&
      pathname !== "/" &&
      pathname !== "/register"
    ) {
      router.replace("/"); // Redirect to login if not authenticated and not on login page
    }
  }, [status, router, pathname]);

  return null; // Render nothing
};

export default AuthRedirect;
