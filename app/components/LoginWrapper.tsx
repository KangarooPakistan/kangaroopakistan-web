"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Login from "../(main)/login/page";
import { Loader2 } from "lucide-react";

export default function LoginWrapper() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <section className="bg-white">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show loading while checking session status
  if (status === "loading") {
    return (
      <section className="bg-white">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p>Checking authentication...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <Login />;
}