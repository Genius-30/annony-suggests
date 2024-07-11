import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { NextAuthOptions } from "next-auth";
import bcryptjs from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await User.findOne({ email: credentials.identifier });

          if (!user) throw new Error("No user found with this email!");

          if (!user.isVerified) {
            throw new Error(
              "User not verified! Please check your email for verification link."
            );
          }

          const isPasswordCorrect = await bcryptjs.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password! Please try again.");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};
