import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return !!token && token.role === 'admin';
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};