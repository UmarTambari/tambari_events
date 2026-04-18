import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db/test";

export async function GET() {
  const isConnected = await testConnection();
  
  if (isConnected) {
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful!" 
    });
  } else {
    return NextResponse.json({ 
      success: false, 
      message: "Database connection failed" 
    }, { status: 500 });
  }
}w