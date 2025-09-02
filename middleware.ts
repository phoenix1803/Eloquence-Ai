import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
    publicRoutes: [
        '/',
        '/login',
        '/signup',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/login/sso-callback',
        '/signup/sso-callback',
        '/sso-callback'
    ],
    ignoredRoutes: [
        '/api/users',
        '/api/users/(.*)',
        '/_next/static',
        '/_next/image',
        '/favicon.ico'
    ],
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}