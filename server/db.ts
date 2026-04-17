import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertFile, InsertUser, files, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all files for a specific user, with optional filtering and search.
 */
export async function getUserFiles(
  userId: number,
  options?: {
    fileType?: string;
    search?: string;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get files: database not available");
    return [];
  }

  try {
    // Get all files for user
    let result = await db.select().from(files).where(eq(files.userId, userId));

    // Apply file type filter if provided
    if (options?.fileType && options.fileType !== "all") {
      result = result.filter((f) => f.fileType === options.fileType);
    }

    // Apply search filter on client side (filename contains search term)
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter((f) =>
        f.filename.toLowerCase().includes(searchLower)
      );
    }

    // Sort by upload date descending
    return result.sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  } catch (error) {
    console.error("[Database] Failed to get user files:", error);
    throw error;
  }
}

/**
 * Create a new file record in the database.
 */
export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create file: database not available");
    return null;
  }

  try {
    const result = await db.insert(files).values(file);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create file:", error);
    throw error;
  }
}

/**
 * Delete a file record from the database.
 */
export async function deleteFile(fileId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete file: database not available");
    return false;
  }

  try {
    // Ensure user owns this file
    const file = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (file.length === 0 || file[0].userId !== userId) {
      console.warn("[Database] File not found or user unauthorized");
      return false;
    }

    await db.delete(files).where(eq(files.id, fileId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete file:", error);
    throw error;
  }
}

/**
 * Get a single file by ID and user ID.
 */
export async function getFileById(fileId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get file: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (result.length === 0 || result[0].userId !== userId) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get file:", error);
    throw error;
  }
}

// TODO: Add more database queries as features grow.
