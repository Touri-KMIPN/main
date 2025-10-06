import { PrismaClient } from '@/generated/prisma'

export const db = new PrismaClient()

export type DbClient = typeof db