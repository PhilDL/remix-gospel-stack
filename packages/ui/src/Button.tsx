import * as React from "react";

export const Button = () => {
  return (
    <div className="rounded-md ">
      <a href="https://turborepo.org/docs/getting-started" role="button">
        <div className="flex w-full items-center justify-center rounded-md border border-transparent bg-orange-500 px-8 py-3 text-base font-medium text-white no-underline hover:bg-gray-700  md:py-3 md:px-10 md:text-lg md:leading-6">
          From "ui" package
          <span className="ml-2 bg-gradient-to-r from-brandred to-brandblue bg-clip-text text-transparent animate-pulse">→</span>
        </div>
      </a>
    </div>
  );
};
