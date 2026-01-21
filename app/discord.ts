import { unstable_cache } from "next/cache"

interface DiscordUser {
  id: string
  username: string
  avatar: string
  global_name: string
}

interface GuildMember {
  user: DiscordUser
  pending: boolean
  roles: string[]
}

function apiCall<T>(url: string, method: string = "GET", body?: T) {
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

export const getGuildMember = async (memberId: string): Promise<GuildMember | undefined> => {    
  console.log(`Fetching user profile (${memberId}) from Discord...`)
  const res = await apiCall(`${process.env.DISCORD_API_URL}/guilds/${process.env.DISCORD_GUILD_ID}/members/${memberId}`);
  return res.ok ? await res.json() : undefined
}

export const getCachedGuildMember = unstable_cache(
  getGuildMember,
  undefined,
  { 
    tags: ['discord'],
    revalidate: parseInt(process.env.CACHE_DISCORD_TTL || '10'), // default to 5s
  }
)

export const sendNewUserNotification = async (discordId: string) => {
  try {
    const res = await apiCall(`${process.env.DISCORD_API_URL}/channels/${process.env.DISCORD_NOTIFICATION_CHANNEL_ID}/messages`, 'POST', {
      embeds: [
        {
          title: 'New Toolbox User ✨',
          description: `<@${discordId}> has signed into the Toolbox for the first time!`,
          color: 0x237feb,
        },
      ],
    });

    if (!res.ok) {
      const text = await res.text()
      console.error('Failed to send Discord log:', res.status, text)
    } 
  } catch (e) {
    console.error('Failed to send Discord log:', e)
  }
}
