import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../lib/mongodb';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      subscribedPodcasts: []          
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}