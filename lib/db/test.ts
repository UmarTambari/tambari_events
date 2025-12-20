import { db } from "./index";
import { users } from "./schema";

export async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Try to query the users table
    const result = await db.select().from(users).limit(1);
    
    console.log("✅ Database connection successful!");
    console.log("Users in database:", result.length);
    
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    return false;
  }
}