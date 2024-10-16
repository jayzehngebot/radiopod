// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { clientPromise } from "./mongodb";
import { compare } from "bcrypt"; // Changed from "bcrypt" to "bcryp

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  subscribedPodcasts: string[];
}


export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const usersCollection = client.db().collection<User>("users");

        const user = await usersCollection.findOne({ name: credentials?.name });
        if (!user) {
          throw new Error("No user found with the provided name.");
        }

        // TODO : Not checking for email match

        const isValid = await compare(credentials!.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          subscribedPodcasts: user.subscribedPodcasts,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };