// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import type { LoaderFunction } from "@remix-run/node";

import Service from "~/services.server";

export const loader: LoaderFunction = async ({ request }) => {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    const url = new URL("/", `http://${host}`);
    // if we can connect to the database and make a simple query
    // and make a HEAD request to ourselves, then we're good.
    const [count] = await Promise.all([
      Service.userRepository.getUsersCount(),
      fetch(url.toString(), { method: "HEAD" }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);
    return new Response(`OK: ${count}`);
  } catch (error: unknown) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
};
