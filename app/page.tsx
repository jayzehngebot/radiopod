// app/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

// Define the User type with nested user object
type User = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    subscribedPodcasts?: { 
      id: string; 
      name: string; 
      rssUrl: string; 
      itunesId: string; 
    }[];
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

      {userData?.user?.subscribedPodcasts && userData.user.subscribedPodcasts.length > 0 && (
        <>
          <div>Render Player Here</div>
          <AudioPlayer
            autoPlay
            src="https://chtbl.com/track/7791D/http://feeds.soundcloud.com/stream/1916284451-qanonanonymous-racist-migrant-voodoo-panic-e294.mp3"
          />
        </>
      )}
      <ul>
        {userData?.user?.subscribedPodcasts && userData.user.subscribedPodcasts.length > 0 ? (
          
          userData.user.subscribedPodcasts.map((podcast) => (
            <div key={podcast.id}>
              <span>{podcast.name}</span><br/>
              <span>{podcast.rssUrl}</span>
            </div>

          ))
        ) : (
          <li>No subscribed podcasts found</li>
        )}
      </ul>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}