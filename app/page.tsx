// app/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name || session?.user?.email}</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}