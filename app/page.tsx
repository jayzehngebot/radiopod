// app/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define the User type with nested user object
type User = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    subscribedPodcasts?: { id: string; name: string }[];
  };
};

export default function HomePage() {
  const { status } = useSession();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/getUserData")
        .then((response) => response.json())
        .then((data) => setUserData(data))
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [status]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Unauthenticated</p>;
  }

  return (
    <div>
      <h1>Welcome, {userData?.user?.name || userData?.user?.email}</h1>
      <Link href="/select-podcasts">Select Podcasts</Link>
      <ul>
        {userData?.user?.subscribedPodcasts && userData.user.subscribedPodcasts.length > 0 ? (
          userData.user.subscribedPodcasts.map((podcast) => (
            <li key={Math.random().toString(36).substr(2, 9)}>{podcast}</li>
          ))
        ) : (
          <li>No subscribed podcasts found</li>
        )}
      </ul>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}