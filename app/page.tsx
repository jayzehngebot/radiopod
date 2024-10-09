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
      uuid: string; 
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

  const handleUnsubscribe = (podcast: { uuid: string }) => {
    console.log('handleUnsubscribe', podcast);
    if (!userData) return;

    // Update the local state
    const updatedPodcasts = userData.user?.subscribedPodcasts?.filter(podcast => podcast.uuid !== podcast.uuid);
    setUserData({
      ...userData,
      user: {
        ...userData.user,
        subscribedPodcasts: updatedPodcasts,
      },
    });
    console.log('remove podcast', podcast.uuid);
    // Optionally, make an API call to update the server-side data
    fetch('/api/unsubscribePodcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ podcast }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Unsubscribed successfully:', data);
    })
    .catch(error => {
      console.error('Error unsubscribing:', error);
    });
  };

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
            <div key={podcast.uuid}>
              <span>{podcast.name}</span><br/>
              <span>{podcast.rssUrl}</span>
              <button onClick={() => handleUnsubscribe({ uuid: podcast.uuid })}>Unsubscribe</button>
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