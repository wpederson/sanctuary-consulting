import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Protect /admin routes — must be logged in
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url))
  }

  // Protect /portal routes — must be logged in
  if (pathname.startsWith('/portal') && !user) {
    const clientId = pathname.split('/')[2]
    return NextResponse.redirect(new URL(`/portal/${clientId}/login`, request.url))
  }

  // If already logged in, skip login pages
  if (user && (pathname === '/login' || pathname === '/')) {
    // Check if admin or client
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('active', true)
      .single()

    if (adminUser) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Client — find their portal
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single()

    if (client) {
      return NextResponse.redirect(new URL(`/portal/${client.id}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
