import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../lib/mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create a new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        subscribedPodcasts: []
      });

      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: 'Error creating user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}