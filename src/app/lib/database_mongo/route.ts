import { NextResponse } from 'next/server';
import dbConnect from './mongodb';

export async function GET() {
  await dbConnect();
  // Your MongoDB operations here
  return NextResponse.json({ message: 'Connected to MongoDB' });
}