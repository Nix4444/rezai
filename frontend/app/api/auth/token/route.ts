import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {

    const sessionToken = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!sessionToken || !sessionToken.sub) {
      console.error('No valid session token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }


    const wsToken = jwt.sign(
      { id: sessionToken.sub },
      process.env.NEXTAUTH_SECRET as string,
      { expiresIn: '1h' }
    );



    return NextResponse.json({ token: wsToken });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json(
      { error: 'Failed to get token' },
      { status: 500 }
    );
  }
} 