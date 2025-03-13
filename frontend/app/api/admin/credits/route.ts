import { NextResponse } from 'next/server';
import { auth } from "../../auth/[...nextauth]/route";
import prisma from '@/lib/database';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const { username, credits } = await request.json();

    // Validate input
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!credits || typeof credits !== 'number' || credits < 1) {
      return NextResponse.json({ error: 'Valid credits amount is required' }, { status: 400 });
    }

    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          increment: credits
        }
      },
      select: {
        id: true,
        username: true,
        credits: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error allocating credits:', error);
    return NextResponse.json({ error: 'Failed to allocate credits' }, { status: 500 });
  }
} 