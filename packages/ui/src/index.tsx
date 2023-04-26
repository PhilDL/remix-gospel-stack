export * from "./Button";

// To be able to use that we need to add that lib to
// serverDependenciesToBundle: [/ui\/.*/],
export const helloFromUILibrary = () => "Function export from UI Library";
