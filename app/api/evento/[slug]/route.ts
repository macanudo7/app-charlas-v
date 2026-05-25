import { db } from '@/lib/db'
import { charlas } from '@/lib/schema'

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {

  const { slug } = await params

  const evento = await db.query.charlas.findFirst({
    where: eq(charlas.slug, slug),
  })

  return NextResponse.json(evento)
}