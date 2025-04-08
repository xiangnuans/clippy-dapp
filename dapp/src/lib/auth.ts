import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { connectToDatabase } from "./mongodb";

export const authOptions: AuthOptions = {
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user._id;
        token.walletAddress = user.walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.sub,
          walletAddress: token.walletAddress as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
