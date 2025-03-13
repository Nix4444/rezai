import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/database';

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users with raw query to avoid TypeScript issues
    const users = await prisma.$queryRaw`
      SELECT id, email, username, role, credits, "createdAt"
      FROM "User"
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 