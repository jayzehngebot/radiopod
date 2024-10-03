import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { User } from "../../lib/mongodb";
// import mongoose from "mongoose"; // Removed unused import

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  console.log("session", session);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use request.json() to parse the request body
  const { podcastIds } = await request.json();

  if (!podcastIds || !Array.isArray(podcastIds)) {
    console.log("podcastIds here", podcastIds);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    if (!session || !session.user) {
      throw new Error("Session or user is undefined");
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("podcastIds", podcastIds);

    // Assuming your schema can handle UUIDs directly
    const podcastObjectIds = podcastIds.filter(id => validateUUID(id));

    if (podcastObjectIds.length !== podcastIds.length) {
      console.log("podcastObjectIds", podcastObjectIds);
      return NextResponse.json({ error: "One or more podcast IDs are invalid" }, { status: 400 });
    }

    user.subscribedPodcasts = [...new Set([...user.subscribedPodcasts, ...podcastObjectIds])];
    await user.save();

    return NextResponse.json({ message: "Podcasts saved successfully" });
  } catch (error) {
    console.error("Error saving podcasts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
