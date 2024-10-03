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

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscribedPodcasts: [{
    type: String,
    validate: { 
      validator: (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v), 
      message: (props: { value: string }) => `${props.value} is not a valid UUID!` 
    }
  }]
});

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model('User', userSchema);

export { clientPromise, User };