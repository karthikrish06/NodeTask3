import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

// Local Mongo URL
const LOCAL_MONGO_URL = 'mongodb://localhost:27017';

// Cloud Mongo URL // Todo: **Caution** Do Not Store Password in Codes
const CLOUD_MONGO_URL =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`

const DbClient = new MongoClient(CLOUD_MONGO_URL);

export default DbClient;