import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login',
    error: '/error',
  }
});
export const config = { matcher: ["/dashboard"] };

// export const config = { matcher: ["/home/:path*"] };