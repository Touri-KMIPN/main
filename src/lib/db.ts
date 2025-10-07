import { MongoClient } from 'mongodb'

export const $mongoClient = new MongoClient(process.env.DATABASE_URI || '')
export const $mongo = $mongoClient.db(process.env.DATABASE_NAME || 'touri-db')