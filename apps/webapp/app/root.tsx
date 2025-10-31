import type { LinksFunction, MetaFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import fontStylesheet from "./styles/fonts.css?url";
import tailwindStylesheetUrl from "./styles/tailwind.css?url";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: fontStylesheet },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "React Router Gospel Stack" },
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
