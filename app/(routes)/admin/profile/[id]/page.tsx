"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function ProfileButton({ params }: any) {
  const { data: session } = useSession();
  const router = useRouter();

  const goToProfile = () => {
    if (session && session.user && session.user.id) {
      router.push(`/admin/profile/${session.user.id}`); // Use session.user.id directly
    }
  };

  return (
    <Button variant="destructive" onClick={goToProfile}>
      Go to profile
    </Button>
  );
}
export default ProfileButton;
