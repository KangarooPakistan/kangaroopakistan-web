
import { db } from '@/app/lib/prisma'
import { compare } from 'bcryptjs'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'


export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
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
      
        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
      
        if (!user) {
          throw new Error('Email not found ')
        }
        // if(user?.password != credentials.password ) {
        //     throw new Error('Invalid password ')
        // }
        const isPasswordValid = await compare(credentials.password, user.password);
      
        if (!isPasswordValid) {
          throw new Error('Invalid password ')
        }
      
        // Modify the return object to match the extended User type
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          contactNumber: user.contactNumber,
          schoolName: user.schoolName,
          schoolId: user.schoolId || null,
        };
      }
      
      // async authorize(credentials, req) {
      //   if (!credentials?.email || !credentials.password) {
      //     return null
      //   }

      //   const user = await db.user.findUnique({
      //     where: {
      //       email: credentials.email
      //     }
      //   })

      //   if (!user) {
      //     return null
      //   }

      //   const isPasswordValid = await compare(
      //     credentials.password,
      //     user.password
      //   )

      //   if (!isPasswordValid) {
      //     return null
      //   }

      //   return {
      //     id: user.id + '',
      //     email: user.email,
      //     role: user.role,
      //     contactNumber: user.contactNumber,
      //     schoolName: user.schoolName,
      //     schoolId: user.schoolId || null,
      //   };
        
      // }
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
          randomKey: u.randomKey
        }
      }
      return token
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }