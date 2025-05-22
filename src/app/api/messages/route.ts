// app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

export async function GET() {
  let client: MongoClient | null = null;
  try {
    client = await getMongoClient();
    const db = client.db('reverence_tech');
    const messages = await db
      .collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      messages.map((msg) => ({
        id: msg._id.toString(),
        content: msg.content,
        createdAt: msg.createdAt,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}