import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { saveIntegration } from "@/lib/integrations/vault"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_SECRET",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Calendar + Drive scopes (Sprints 3 e 5)
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    }
  },
  events: {
    // Ao logar com Google, copia os tokens OAuth para o cofre criptografado
    // (Integration) para que os conectores de sync os usem.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.id) {
        await saveIntegration(
          "google",
          {
            label: "Google",
            accessToken: account.access_token ?? undefined,
            refreshToken: account.refresh_token ?? undefined,
            scopes: account.scope ?? undefined,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
            status: "connected",
          },
          user.id,
        )
      }
    },
  },
})
