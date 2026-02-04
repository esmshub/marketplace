import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { createUser, getUser, getUserByEmail } from "./lib/repos/user";
import { getGuildMember, sendNewUserNotification } from "./discord";
import { revalidateTag } from "next/cache";
// import { unstable_cache } from "next/cache";

// export const getCachedUser = unstable_cache(
//   (userId: number) => {
//     console.log(`Fetching user (${userId}) from Database...`)
//     return getUser(userId);
//   },
//   undefined,
//   { 
//     tags: ['users'],
//     revalidate: parseInt(process.env.CACHE_USER_TTL || '5'),
//   }
// )

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    DiscordProvider({
      authorization: {
        params: { scope: "email guilds.members.read" },
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider !== "discord") return false;

      const guildMembership = await getGuildMember(account.providerAccountId);
      if (!guildMembership) {
        revalidateTag(`discord:${account.providerAccountId}`, "max");
        return false;
      }
      if (guildMembership.pending) {
        revalidateTag(`discord:${account.providerAccountId}`, "max");
        return "/login?error=AccountPending";
      }

      const appUser = await getUserByEmail(user.email);
      if (!appUser) {
        await createUser({
          emailAddress: user.email,
          fullName: user.name ?? "",
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });
        await sendNewUserNotification(guildMembership.user.id);
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // initial sign-in switch the sub in JWT to DB User ID
        const profile = await getUserByEmail(user.email!);
        if (!profile) throw new Error("User not found");

        token.sub = profile.id.toString();
      }

      return token;
    },
    async session({ session, token }) {
      const appUser = await getUser(parseInt(token.sub!));
      if (!appUser) throw new Error('Local account not found');

      if (appUser.provider === "discord") {
        // refresh Discord roles
        const discordAccount = await getGuildMember(appUser.providerAccountId!);
        if (!discordAccount) {
          revalidateTag(`discord:${appUser.providerAccountId}`, "max");
          throw new Error("Provider account not found");
        }

        session.user.isAdmin = discordAccount.roles?.includes(process.env.DISCORD_ADMIN_ROLE_ID!);
        session.user.username = discordAccount.user.username;
      }

      return session;
    }
  },
});