import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/client';

const adapter = new PrismaBetterSqlite3({ url: 'file:./test.db' });
const prisma = new PrismaClient({ adapter });

export { prisma };
