
import { db } from '@/app/lib/prisma'
import { compare } from 'bcryptjs'
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'


export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/',
    error: '/', // Redirect errors back to homepage/login instead of /api/auth/error
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com'
        },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
      
        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
        
          if (!user) {
            throw new Error('Email not found')
          }
          
          const isPasswordValid = await compare(credentials.password, user.password);
        
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }
        
          // Modify the return object to match the extended User type
          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
            contactNumber: user.contactNumber,
            schoolName: user.schoolName,
            district: user.district,
            schoolId: user.schoolId || null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          district: token.district,
          randomKey: token.randomKey
        }
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any
        return {
          ...token,
          id: u.id,
          role: u.role,
          district: u.district,
          randomKey: u.randomKey
        }
      }
      return token
    }
  }
}