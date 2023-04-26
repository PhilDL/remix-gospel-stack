import Link from "next/link";

export default function IndexPage() {
  return (
    <div>
      <h1>Hello World</h1>
      <Link href="/api/users">View Users</Link>
    </div>
  );
}
