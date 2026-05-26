import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isEduEmail, extractUniversityFromEmail } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;
        if (user.banned) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          university: user.university,
          verified: user.verified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.role = u.role;
        token.university = u.university;
        token.verified = u.verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as any;
        u.id = token.id as string;
        u.role = token.role as string;
        u.university = token.university as string;
        u.verified = token.verified as boolean;
      }
      return session;
    },
  },
});

// Helper to get current session user in server components
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// Helper to require auth in server actions
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: You must be logged in.");
  return user;
}
