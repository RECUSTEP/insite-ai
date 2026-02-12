import { getRequestContext } from "@cloudflare/next-on-pages";

async function handler(request: Request) {
  const requestContext = getRequestContext();
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "");
  const query = url.searchParams.toString();
  const origin = url.origin;
  const response = await requestContext.env.API_SERVICE.fetch(`${origin}${path}?${query}`, {
    method: request.method,
    body: request.body,
    // @ts-ignore
    duplex: request.body ? "half" : undefined,
    headers: request.headers,
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
