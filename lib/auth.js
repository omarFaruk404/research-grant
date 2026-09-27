// lib/auth.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

/**
 * Wraps an API handler with authentication logic.
 * @param {Function} handler - The original API route function (GET, POST, etc.)
 */
export function withAuth(handler) {
  return async (req, params) => {
    // 1. Extract Token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // 2. Verify Token
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      // (Optional) You can attach the user to the request headers if needed
      // req.headers.set("x-user-id", payload.id); 

      // 3. Token is valid -> Run the original handler
      return handler(req, params);

    } catch (error) {
      console.error("Auth Error:", error.message);
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
}