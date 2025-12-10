import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      authorization: {
        params: { scope: "identify guilds.members.read" },
      },
    }),
    // ...add more providers here
  ],
  trustHost: true,
  callbacks: {
    // async signIn({ user, account, profile }) {
    //   const accessToken = account.access_token;

    //   const guildProfile = await fetch(
    //     `https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
    //     {
    //       headers: { Authorization: `Bearer ${accessToken}` },
    //     }
    //   ).then((res) => res.json());

    //   // console.log(guildProfile);

    //   if (!guildProfile.roles.includes(process.env.DISCORD_MEMBER_ROLE_ID)) {
    //     console.error(`User does not hold required role (${process.env.DISCORD_MEMBER_ROLE_ID}) in guild (${process.env.DISCORD_GUILD_ID})`);
    //     return false;
    //   }

    //   return true; // allow login
    // },
    async jwt({ token, account }) {
      if (account?.access_token) {
        // check role is assigned
        const guildProfile = await fetch(
          `https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
          {
            headers: { Authorization: `Bearer ${account?.access_token}` },
          }
        ).then((res) => res.json());

        token.isMember = !!guildProfile
        token.hasRole = guildProfile?.roles?.includes(process.env.DISCORD_MEMBER_ROLE_ID)
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          hasRole: token.hasRole,
          isMember: token.isMember,
        },
      };
    }
  },
});