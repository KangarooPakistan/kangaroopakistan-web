import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Define your custom user type
type MyUser = {
  id: string;
  email: string;
  role: string;
  contactNumber: string | null,
  schoolName: string | null,
  schoolId: string |null,
  // include other user properties as needed
};


// Extend the User type from NextAuth with your custom fields
declare module "next-auth" {
  interface User extends MyUser {}

  interface Session {
    user: User;
  }
}

// Extend the JWT type if you're using JWT
declare module "next-auth/jwt" {
  interface JWT {
    user: MyUser;
  }
}
