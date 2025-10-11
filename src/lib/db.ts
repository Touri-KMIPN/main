import { MongoClient } from 'mongodb'

// Use a valid mock URI if no DATABASE_URI is provided
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'touri-db'

export const $mongoClient = new MongoClient(DATABASE_URI)
export const $mongo = $mongoClient.db(DATABASE_NAME)