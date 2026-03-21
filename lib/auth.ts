import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email }).lean();

        if (!user) {
          throw new Error('No account found with this email');
        }

        if (!user.password) {
          throw new Error('This account uses Google sign-in');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email }).lean();

        if (!existingUser) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: 'google',
          });
          user.id = newUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        if (typeof user.image === 'string' && !user.image.startsWith('data:image/')) {
          token.picture = user.image;
        }
      }

      if (trigger === 'update' && session?.user) {
        if (session.user.name !== undefined) token.name = session.user.name;
        if (session.user.email !== undefined) token.email = session.user.email;
        if (
          typeof session.user.image === 'string' &&
          !session.user.image.startsWith('data:image/')
        ) {
          token.picture = session.user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        try {
          await connectDB();
          const dbUser = await User.findById(token.id)
            .select({ name: 1, email: 1, image: 1 })
            .lean();

          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.image = dbUser.image || '';
            return session;
          }
        } catch {
          // Fall back to token values if DB read fails.
        }

        session.user.name = typeof token.name === 'string' ? token.name : session.user.name;
        session.user.email = typeof token.email === 'string' ? token.email : session.user.email;
        session.user.image = typeof token.picture === 'string' ? token.picture : session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
