import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { User } from "../../lib/mongodb";
// import { Podcast } from "../../lib/mongodb";
import mongoose from "mongoose"; // Removed unused import

// Ensure the database connection is established
const mongoUri = process.env.MONGODB_URI || 'default_mongo_uri_here';
mongoose.connect(mongoUri).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

// Define an interface for the podcast
interface Podcast {
    uuid: string;
    name: string;
    rssUrl: string;
    itunesId: string;

}

// function validateUUID(id: string): boolean {
//   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//   return uuidRegex.test(id);
// }

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  console.log("session", session);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { podcast } = await request.json();
  console.log('podcast', podcast);
  if (!podcast) {
    console.error("Podcast is undefined in the request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }


  try {
    if (!session || !session.user) {
      throw new Error("Session or user is undefined");
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the podcast exists in the user's subscribedPodcasts
    const podcastIndex = user.subscribedPodcasts.findIndex((p: Podcast) => p.uuid === podcast.uuid);
    console.log('podcastIndex', podcastIndex);
    console.log('user.subscribedPodcasts', user.subscribedPodcasts);
    
    if (podcastIndex === -1) {
      return NextResponse.json({ error: "Podcast not found in subscriptions" }, { status: 404 });
    }

    // Remove the podcast from the user's subscribedPodcasts array
    user.subscribedPodcasts.splice(podcastIndex, 1);

    await user.save();

    return NextResponse.json({ message: "Podcast unsubscribed successfully" });
  } catch (error) {
    console.error("Error updating podcasts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
