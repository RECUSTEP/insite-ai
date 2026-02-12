import { cookies } from "next/headers";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "./lib/api";

export const config = {
  matcher: ["/:path*"],
};

function basicAuth() {
  return (req: NextRequest) => {
    const isLocalDevelopment = process.env.NODE_ENV === "development";
    const isProduction = process.env.DEPLOYMENT_ENV === "production";

    const isRequiredAuth = !isLocalDevelopment && !isProduction;

    if (!isRequiredAuth) {
      return NextResponse.next();
    }

    if (isRequiredAuth && (!process.env.BASIC_USERNAME || !process.env.BASIC_PASSWORD)) {
      return new Response("Internal Server Error", { status: 500 });
    }

    const basicAuth = req.headers.get("authorization");
    if (!basicAuth) {
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }

    try {
      const authValue = basicAuth.split(" ")[1] ?? "";
      const [user, pwd] = atob(authValue).split(":");

      if (user === process.env.BASIC_USERNAME && pwd === process.env.BASIC_PASSWORD) {
        return NextResponse.next();
      }
    } catch {
      return new Response("Invalid Authentication", { status: 400 });
    }

    return new Response("Unauthorized", { status: 401 });
  };
}

function adminGuard(middleware: NextMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const { pathname } = req.nextUrl;
    if (pathname.match(/^\/(api|_next\/static|favicon.ico)/)) {
      return middleware(req, event);
    }

    const client = createClient();
    const session = await client.admin.session.$get(
      {},
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (pathname === "/login" && session.ok) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname !== "/login" && !session.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return middleware(req, event);
  };
}

export default adminGuard(basicAuth());
