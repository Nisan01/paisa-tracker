import { createUser, getUserByEmail } from "@/utils/db/users";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { User } from "next-auth";

if (process.env.NEXTAUTH_URL?.trim() === "") {
  delete process.env.NEXTAUTH_URL;
}

const providers: NextAuthOptions["providers"] = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }: { user: User }) {
      if (!user.email) return false;

      const existingUser = await getUserByEmail(user.email);

      if (!existingUser) {
        const newUser = await createUser({
          email: user.email,
          name: user.name || "User",
        });

        user.id = newUser.id;
      } else {
        user.id = existingUser.id;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
