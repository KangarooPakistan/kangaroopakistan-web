"use client";

import Login from "../(main)/login/page";

export default function LoginWrapper() {
  // No session checks here - server-side redirect handles logged-in users
  // This component only renders for users who passed the server-side check (not logged in)
  return <Login />;
}