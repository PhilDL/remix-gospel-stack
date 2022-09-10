// This will require a restart of the remix-server if changed because
// the library is called from server
export function helloWorld(name?: string) {
  return `Hello World to ${name}`;
}
