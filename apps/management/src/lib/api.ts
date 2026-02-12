import { getRequestContext } from "@cloudflare/next-on-pages";
import type { AppType } from "api";
import { hc } from "hono/client";

type Input = Parameters<typeof fetch>[0];
type Init = Parameters<typeof fetch>[1];

export function createFetch(
  defaultInit: Init = {},
): (input: Input, init?: Init) => ReturnType<typeof fetch> {
  return (input, init) => fetch(input, { ...defaultInit, ...init });
}

export function createClient(fetcher?: typeof fetch) {
  let local = fetcher;
  const requestContext = getRequestContext();
  if (!local) {
    // @ts-ignore
    local = requestContext.env.API_SERVICE.fetch.bind(requestContext.env.API_SERVICE);
  }
  return hc<AppType>(requestContext.env.API_URL, {
    fetch: local,
  });
}
