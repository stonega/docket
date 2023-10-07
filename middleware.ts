import { authMiddleware } from "@clerk/nextjs";
import { NextFetchEvent, NextRequest } from "next/server";
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
// export default authMiddleware({
//   afterAuth: (auth, req) => {
//     console.log(req.method);
//   },
//   ignoredRoutes: ['/api/site'],
// });

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization,  Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  const auth = authMiddleware({
    ignoredRoutes: ["/"],
  });
  return auth(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
