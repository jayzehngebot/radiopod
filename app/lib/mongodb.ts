// lib/mongodb.ts
import { MongoClient } from "mongodb";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const uri: string = process.env.MONGODB_URI;
// const options = {
//   databaseName: 'radiopod',
// };

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const validOptions = {}; // Adjust this object to include only valid MongoClientOptions properties
    client = new MongoClient(uri, validOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const validOptions = {}; // Adjust this object to include only valid MongoClientOptions properties
  client = new MongoClient(uri, validOptions);
  clientPromise = client.connect();
}

// Mongoose connection
mongoose.connect(uri, {}).then(() => {
  console.log("Connected to MongoDB with Mongoose");
}).catch(err => {
  console.error("Error connecting to MongoDB with Mongoose", err);
});

// Define Podcast schema
const podcastSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  rssUrl: { type: String, required: true },
  itunesId: { type: String, required: true },
  // Add any other fields as necessary
});

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscribedPodcasts: { type: [podcastSchema], default: [] } // Define as an array of podcast objects
});

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model('User', userSchema);

export { clientPromise, User };