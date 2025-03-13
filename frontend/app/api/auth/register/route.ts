import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if username already exists using raw query
    const usernameCheckResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "User" WHERE "username" = ${username}
    `;
    
    // @ts-ignore - The result is an array with a count object
    if (usernameCheckResult[0].count > 0) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = uuidv4();
    const now = new Date();


    await prisma.$executeRaw`
            INSERT INTO "User" (
              "id", "email", "username", "password", "role", "profile","formatted",
              "createdAt", "updatedAt"
            ) 
            VALUES (
              ${userId}, ${email}, ${username}, ${hashedPassword}, 'USER','','',${now}, ${now}
            )
          `;


    // Return success
    return NextResponse.json(
      {
        id: userId,
        username: username,
        email: email.toLowerCase(),
        role: "USER",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
} 