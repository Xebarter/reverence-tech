// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { getMongoClient } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing username or password');
        }

        let client: MongoClient | null = null;
        try {
          client = await getMongoClient();
          const db = client.db('reverence_tech');
          const user = await db
            .collection('users')
            .findOne({ username: credentials.username });

          if (!user) {
            throw new Error('No user found with this username');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Incorrect password');
          }

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw new Error('Authentication failed');
        } finally {
          if (client) {
            await client.close(); // Optional: remove if using pooling
          }
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
