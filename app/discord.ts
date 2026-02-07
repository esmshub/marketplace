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

function apiCall<T>(url: string, method: string = "GET", body?: T, cacheOptions?: NextFetchRequestConfig & { cacheTrace?: boolean }) {
  const { cacheTrace, ...nextOptions } = cacheOptions || {};
  let start = 0
  if (cacheTrace) {
      start = performance.now();
  }
  const res = fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    ...(cacheOptions && { next: nextOptions }),
  });
  if (cacheTrace) {
    const elapsed = performance.now() - start
    console.log(
      `[fetch] url=${url} time=${elapsed.toFixed(1)}ms`,
      elapsed < 20 ? '(HIT)' : '(MISS)'
    );
  }

  return res;
}


export const getGuildMember = async (memberId: string): Promise<GuildMember | undefined> => {  
  const res = await apiCall(
    `${process.env.DISCORD_API_URL}/guilds/${process.env.DISCORD_GUILD_ID}/members/${memberId}`,
    'GET',
    undefined,
    { revalidate: 3600, tags: [`discord:${memberId}`, 'discord'] }
  );

  return res.ok ? await res.json() : undefined
}

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
