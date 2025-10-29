import { PassThrough } from "stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type HandleDocumentRequestFunction } from "react-router";

export const streamTimeout = 5000;

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>;

export default async function handleRequest(...args: DocRequestArgs) {
  const [request, responseStatusCode, responseHeaders, reactRouterContext] =
    args;
  return new Promise((resolve, reject) => {
    let didError = false;

    const callbackName = isbot(request.headers.get("user-agent"))
      ? "onAllReady"
      : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={reactRouterContext} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html; charset=utf-8");
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
