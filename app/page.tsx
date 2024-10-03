// app/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name || session?.user?.email}</h1>
      <Link href="/select-podcasts">Select Podcasts</Link>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}