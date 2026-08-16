import axios from 'axios';

export async function sendWebhookHit(username, webhookUrl, stats = null) {
  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
    return;
  }

  const payload = {
    username: 'EnzoChecker',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
    embeds: [
      {
        title: '🔥 New Available Username Captured!',
        color: 0xff0000,
        description: `**Username:** \`${username}\`\n**Status:** \`Available\`\n**Time:** <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
          {
            name: 'Length',
            value: `${username.length} characters`,
            inline: true,
          },
          ...(stats
            ? [
                {
                  name: 'Total Hits',
                  value: `${stats.hits}`,
                  inline: true,
                },
                {
                  name: 'Checked',
                  value: `${stats.checked}`,
                  inline: true,
                },
              ]
            : []),
        ],
        footer: {
          text: 'EnzoChecker • By Enzo',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(webhookUrl, payload, { timeout: 5000 });
  } catch {
  }
}
