import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const loginUrl = new URL('/login', `${protocol}://${host}`);

  // Use 303 See Other to force GET redirect after POST
  return NextResponse.redirect(loginUrl, 303);
}