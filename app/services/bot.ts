import axios from "axios";

export interface ApplicationSubmission {
  id: string;
  userId: string;
  discordId: string;
  username: string;
  avatarUrl: string;
  minecraftUsername: string;
  applicationType: string;
  answers: Record<string, string>;
  submittedAt: string;
  status: "pending" | "accepted" | "rejected";
  messageId?: string;
}

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const APPLICATION_CHANNEL_ID = process.env.DISCORD_APPLICATION_CHANNEL_ID;
const API_BASE = "https://discord.com/api/v10";

/**
 * Send application embed to Discord channel
 */
export async function sendApplicationEmbed(
  application: ApplicationSubmission
): Promise<string | null> {
  try {
    const embed = {
      color: 0xff6b00, // Orange color matching the theme
      author: {
        name: `${application.username}#${application.discordId}`,
        icon_url: application.avatarUrl,
      },
      title: `New ${application.applicationType}`,
      description: `**Minecraft Username:** ${application.minecraftUsername}`,
      fields: Object.entries(application.answers).map(([question, answer]) => ({
        name: question,
        value: answer,
        inline: false,
      })),
      footer: {
        text: `Application ID: ${application.id} • Submitted at`,
        icon_url: application.avatarUrl,
      },
      timestamp: application.submittedAt,
    };

    const payload = {
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "✅ Accept Applicant",
              style: 3, // Green
              custom_id: `accept_app_${application.id}`,
              disabled: false,
            },
            {
              type: 2,
              label: "❌ Reject Applicant",
              style: 4, // Red
              custom_id: `reject_app_${application.id}`,
              disabled: false,
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `${API_BASE}/channels/${APPLICATION_CHANNEL_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.error("Error sending application embed:", error);
    return null;
  }
}

/**
 * Send DM to user with application result
 */
export async function sendApplicationResultDM(
  userId: string,
  status: "accepted" | "rejected",
  applicationId: string
): Promise<boolean> {
  try {
    // Create DM channel
    const dmChannelResponse = await axios.post(
      `${API_BASE}/users/@me/channels`,
      { recipient_id: userId },
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const channelId = dmChannelResponse.data.id;

    const embed =
      status === "accepted"
        ? {
            color: 0x00ff00, // Green
            title: "✅ Application Accepted!",
            description:
              "Congratulations! Your application has been accepted. Welcome to the team!",
            fields: [
              {
                name: "Next Steps",
                value:
                  "Check the server for your new role and permissions. If you have any questions, feel free to reach out to our moderators.",
                inline: false,
              },
            ],
            footer: {
              text: `Application ID: ${applicationId}`,
            },
            timestamp: new Date().toISOString(),
          }
        : {
            color: 0xff0000, // Red
            title: "❌ Application Rejected",
            description:
              "Unfortunately, your application was not accepted at this time.",
            fields: [
              {
                name: "Feedback",
                value:
                  "Feel free to apply again in the future or contact our moderators for feedback.",
                inline: false,
              },
            ],
            footer: {
              text: `Application ID: ${applicationId}`,
            },
            timestamp: new Date().toISOString(),
          };

    await axios.post(
      `${API_BASE}/channels/${channelId}/messages`,
      {
        embeds: [embed],
      },
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error sending DM:", error);
    return false;
  }
}

/**
 * Disable application message buttons
 */
export async function disableApplicationButtons(
  messageId: string
): Promise<boolean> {
  try {
    const payload = {
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "✅ Accept Applicant",
              style: 3,
              custom_id: `accept_app_disabled`,
              disabled: true,
            },
            {
              type: 2,
              label: "❌ Reject Applicant",
              style: 4,
              custom_id: `reject_app_disabled`,
              disabled: true,
            },
          ],
        },
      ],
    };

    await axios.patch(
      `${API_BASE}/channels/${APPLICATION_CHANNEL_ID}/messages/${messageId}`,
      payload,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error disabling buttons:", error);
    return false;
  }
}

/**
 * Check if user has moderator role
 */
export async function hasModeratorRole(
  userId: string,
  requiredRoleId: string
): Promise<boolean> {
  try {
    const response = await axios.get(
      `${API_BASE}/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    return response.data.roles.includes(requiredRoleId);
  } catch (error) {
    console.error("Error checking moderator role:", error);
    return false;
  }
}

/**
 * Give role to user
 */
export async function giveRoleToUser(
  userId: string,
  roleId: string
): Promise<boolean> {
  try {
    await axios.put(
      `${API_BASE}/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${roleId}`,
      {},
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error giving role to user:", error);
    return false;
  }
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<boolean> {
  try {
    await axios.delete(
      `${API_BASE}/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${roleId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error removing role from user:", error);
    return false;
  }
}
