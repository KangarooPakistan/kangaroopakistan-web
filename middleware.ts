import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TypeUser } from "./app/api/auth/[...nextauth]/options";
import { MyUser } from "./next-auth";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";

// This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
//   try {
//     const { pathname }: { pathname: string } = request.nextUrl;
//     const token = await getToken({ req: request });
//     const user: string | null = token?.role as string;
//     console.log("user")
//     console.log(pathname)
//     console.log("token");
//     console.log(user);
//     // console.log(token?.role);
//     console.log(user);
//     // console.log(user);
//     // console.log("server")

//     // Define the routes that are accessible to all users
//     const publicRoutes: string[] = ["/login", "/register"];

//     // Check if the user is authenticated
//     if (!token) {
//       console.log('kkr')
//       // Allow access to public routes
//       if (publicRoutes.includes(pathname)) {
//         return null;
//       }

//       // Redirect to login if not authenticated
//       return NextResponse.redirect(
//         new URL("/login?error=Please login first to access this route", request.url)
//       );
//     }

//     // Define role-based routes
//     const roleBasedRoutes: { [key: string]: string[] } = {
//       Admin: ["/admin/*", "/dashboard"],
//       User: ["/user/*", "/dashboard"],
//     };

//     // Check if the user's role allows access to the current route
//     if (roleBasedRoutes[user].some((route: string) => 
    
//     {
//       console.log('-------------------------------------------------------------')
//       console.log(user)
//       console.log('aminah')
//       console.log('kkr')
//       console.log(route)
//       console.log('kkr')
//       pathname.startsWith(route)
//     })) {
//       console.log('kkr')
//       console.log(user)
//       console.log('kkr')
//       console.log('kkr')
      
//       // Redirect to a restricted route or return an error (e.g., 401)
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     // If the route doesn't match any of the above conditions, continue with the request
//     return null;
//   } catch (error) {
//     // Handle any errors that occur during the middleware execution
//     console.error(error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }
export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = await getToken({ req: request });
    const userRole = token?.role as string;

    const publicRoutes = ["/login", "/register"];
    const roleBasedRoutes = {
      Admin: ["/admin", "/dashboard"],
      User: ["/user", "/dashboard"],
    };

    if (!token && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && userRole) {
      const allowedRoutes = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes];
      const isAllowed = allowedRoutes.some((route)=> pathname.startsWith(route));
      console.log('aminahs')
      console.log(userRole as keyof typeof roleBasedRoutes)
      console.log(roleBasedRoutes[userRole as keyof typeof roleBasedRoutes])
      console.log(allowedRoutes.some((route)=> pathname.startsWith(route))) 
      console.log(pathname.startsWith("/user/*")) 
      console.log('aminah')
      console.log(isAllowed)
      console.log('aminahs')

      if (isAllowed === false) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return null;
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/admin/:path*",
    "/user/:path*",
    "/api/admin/:function*",
    "/api/user/:function*",
    "/dashboard",
    "/user/dashboard",
  ],
};
