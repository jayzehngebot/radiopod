// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { hash } from "bcryptjs";

interface User {
  name: string;
  password: string;
  email: string;
}

export async function POST(request: NextRequest) {
//   console.log("signup route", request.json());
  const { name, password, email } = await request.json();

  console.log("signup route", name, password, email);
  
  if (!name || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const usersCollection = client.db().collection<User>("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const newUser: User = {
      name,
      email,
      password: hashedPassword,
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Signup route error:", error); // Added error logging
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}