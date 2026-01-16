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

export const getGuildMember = async (memberId: string): Promise<GuildMember | null> => {    
  console.log(`Fetching user profile (${memberId}) from Discord...`)
  const res = await apiCall(`${process.env.DISCORD_API_URL}/guilds/${process.env.DISCORD_GUILD_ID}/members/${memberId}`);
  return res.ok ? await res.json() : null
}

export const getCachedGuildMember = unstable_cache(
  getGuildMember,
  undefined,
  { 
    tags: ['discord'],
    revalidate: 300 // 5 mins
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
