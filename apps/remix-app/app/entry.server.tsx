import { PassThrough } from "stream";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady: () => {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError: (err) => {
          reject(err as Error);
        },
        onError: (error) => {
          didError = true;

          console.error(error);
        },
      },
    );

    setTimeout(abort, streamTimeout + 5000);
  });
}
