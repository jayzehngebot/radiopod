"use client";

import React, { useEffect, useState } from "react";

interface Podcast {
  uuid: string;
  name: string;
  rssUrl: string;
  itunesId: string;
}

export default function SelectPodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch("/api/fetchPodcasts?term=podcast"); 
        if (!response.ok) {
          throw new Error("Failed to fetch podcasts");
        }
        const data = await response.json();
        console.log("data", data);
        setPodcasts(data.searchForTerm.podcastSeries);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchPodcasts();
  }, []);

  return (
    <div>
      <h1>Select Podcasts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="podcast-list grid grid-cols-3 gap-4">
      {podcasts?.map((podcast) => (
        <div key={podcast.uuid} className="podcast-card p-4 border border-gray-300 rounded-md">
          <h2>{podcast.name}</h2>
          <p>RSS URL: {podcast.rssUrl}</p>
          <p>iTunes ID: {podcast.itunesId}</p>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={async () => {
              try {
                const response = await fetch("/api/savePodcasts", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ podcast }), // Send entire podcast object
                });

                if (!response.ok) {
                  throw new Error("Failed to subscribe to podcast");
                }

                alert("Subscribed successfully!");
              } catch (error: unknown) {
                if (error instanceof Error) {
                  setError(error.message);
                } else {
                  setError('An unknown error occurred');
                }
              }
            }}
          >
            Subscribe
          </button>
          <button>Unsubscribe</button>
        </div>
      ))}
      <div>
        <input type="text" placeholder="Search podcasts" />
        <button>Search</button>
      </div>
    </div>
    </div>
  );
}