// // lib/db.js
// import { MongoClient } from 'mongodb';

// const uri = "mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// if (!uri) {
//   throw new Error('Please define the MONGODB_URI environment variable inside .env');
// }

// let client;
// let clientPromise;

// if (!global._mongoClientPromise) {
//   client = new MongoClient(uri);
//   global._mongoClientPromise = client.connect();
// }
// clientPromise = global._mongoClientPromise;

// export default clientPromise;


// lib/db.js
// src/app/lib/db.js
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/bharattapp?retryWrites=true&w=majority&appName=Cluster0";

if (!uri) {
  throw new Error('Please define the MONGODB_URI');
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
