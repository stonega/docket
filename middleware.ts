import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/privacy"],
  afterAuth: (auth, request) => {
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }
    if (!auth.userId) {
      return redirectToSignIn({ returnBackUrl: request.url });
    }
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
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
