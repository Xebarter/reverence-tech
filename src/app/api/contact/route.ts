import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  // Here you could integrate with email services (e.g., SendGrid, Resend, Nodemailer)
  console.log('New Contact Submission:', { name, email, subject, message });

  return NextResponse.json({ success: true });
}
