"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AuthRedirect = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    // Skip all redirect logic for homepage - handled by server-side check
    if (pathname === "/" || pathname === "/login") return;
    
    // Only handle protection for other routes
    if (
      status === "unauthenticated" &&
      pathname !== "/" &&
      pathname !== "/login" &&
      pathname !== "/register" &&
      pathname !== "/results" &&
      pathname !== "/reset-password" &&
      !pathname.startsWith("/new-password/")
    ) {
      router.replace("/"); // Redirect to homepage for protected routes
    }
  }, [status, router, pathname]);

  return null; // Render nothing
};

export default AuthRedirect;
