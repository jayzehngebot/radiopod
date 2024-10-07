import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
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

  try {
    if (!session || !session.user) {
      throw new Error("Session or user is undefined");
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the podcast already exists in the user's subscribedPodcasts
    const podcastExists = user.subscribedPodcasts.some((p: any) => p.uuid === podcast.uuid);
    if (podcastExists) {
      return NextResponse.json({ error: "Podcast already subscribed" }, { status: 409 });
    }

    // Add the new podcast to the user's subscribedPodcasts array
    user.subscribedPodcasts.push(podcast);

    await user.save();

    return NextResponse.json({ message: "Podcast subscribed successfully" });
  } catch (error) {
    console.error("Error saving podcasts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
