import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// see https://github.com/remix-run/remix/pull/8829
// "Fix build errors with Vite .css?url imports #8829"
// import fontStylesheet from "./styles/fonts.css?url";
// import tailwindStylesheetUrl from "./styles/tailwind.css?url";

import "./styles/fonts.css";
import "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [
    // { rel: "stylesheet", href: fontStylesheet },
    // { rel: "stylesheet", href: tailwindStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "Remix Gospel Stack" },
    { viewport: "width=device-width,initial-scale=1" },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
