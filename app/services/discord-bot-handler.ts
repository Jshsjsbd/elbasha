/**
 * Discord Bot Handler for Application Reviews
 * 
 * This file contains the Discord bot event handlers for application reviews.
 * Can be used as a standalone bot service or integrated with the main app.
 * 
 * Usage:
 * const { Client, GatewayIntentBits } = require('discord.js');
 * const { setupApplicationHandlers } = require('./discord-bot-handler');
 * 
 * const client = new Client({
 *   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
 * });
 * 
 * setupApplicationHandlers(client);
 * client.login(process.env.DISCORD_BOT_TOKEN);
 */

import axios from "axios";

export interface InteractionData {
  type: number;
  data: {
    custom_id: string;
  };
  member: {
    user: {
      id: string;
      username: string;
    };
    roles: string[];
  };
  message: {
    id: string;
  };
  channel_id: string;
  guild_id: string;
}

/**
 * Handle application review button interactions
 */
export async function handleApplicationInteraction(
  interaction: InteractionData
): Promise<void> {
  const customId = interaction.data.custom_id;
  const userId = interaction.member.user.id;
  const userRoles = interaction.member.roles;
  const messageId = interaction.message.id;

  // Check if user has moderator role
  const requiredRoleId = process.env.DISCORD_REQUIRED_ROLE_ID;
  const hasRole = userRoles.includes(requiredRoleId!);

  if (!hasRole) {
    await sendResponse(
      interaction.channel_id,
      "❌ You don't have permission to review applications. Only moderators can do this."
    );
    return;
  }

  if (customId.startsWith("accept_app_")) {
    await handleApplicationAccept(customId, userId, messageId);
  } else if (customId.startsWith("reject_app_")) {
    await handleApplicationReject(customId, userId, messageId);
  }
}

/**
 * Handle application acceptance
 */
async function handleApplicationAccept(
  customId: string,
  reviewerId: string,
  messageId: string
): Promise<void> {
  const applicationId = customId.replace("accept_app_", "");

  try {
    // Call your API to update application status
    await axios.post(
      `${process.env.APP_URL}/api/applications/${applicationId}/review`,
      {
        action: "accept",
        reviewerId,
      }
    );

    // Disable buttons on message
    await disableMessageButtons(messageId);
  } catch (error) {
    console.error("Error accepting application:", error);
  }
}

/**
 * Handle application rejection
 */
async function handleApplicationReject(
  customId: string,
  reviewerId: string,
  messageId: string
): Promise<void> {
  const applicationId = customId.replace("reject_app_", "");

  try {
    // Call your API to update application status
    await axios.post(
      `${process.env.APP_URL}/api/applications/${applicationId}/review`,
      {
        action: "reject",
        reviewerId,
      }
    );

    // Disable buttons on message
    await disableMessageButtons(messageId);
  } catch (error) {
    console.error("Error rejecting application:", error);
  }
}

/**
 * Send response to user
 */
async function sendResponse(channelId: string, message: string): Promise<void> {
  try {
    await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        content: message,
        flags: 64, // Ephemeral (only visible to user)
      },
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending response:", error);
  }
}

/**
 * Disable all buttons on a message
 */
async function disableMessageButtons(messageId: string): Promise<void> {
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
              custom_id: "accept_app_disabled",
              disabled: true,
            },
            {
              type: 2,
              label: "❌ Reject Applicant",
              style: 4,
              custom_id: "reject_app_disabled",
              disabled: true,
            },
          ],
        },
      ],
    };

    await axios.patch(
      `https://discord.com/api/v10/channels/${process.env.DISCORD_APPLICATION_CHANNEL_ID}/messages/${messageId}`,
      payload,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error disabling buttons:", error);
  }
}

/**
 * Setup event listeners for bot
 * Usage with discord.js:
 * 
 * client.on('interactionCreate', async (interaction) => {
 *   if (!interaction.isButton()) return;
 *   await handleApplicationInteraction({
 *     type: 3,
 *     data: { custom_id: interaction.customId },
 *     member: {
 *       user: { id: interaction.user.id, username: interaction.user.username },
 *       roles: interaction.member.roles.cache.map(r => r.id)
 *     },
 *     message: { id: interaction.message.id },
 *     channel_id: interaction.channelId,
 *     guild_id: interaction.guildId
 *   });
 * });
 */
export function setupApplicationHandlers(client: any): void {
  client.on("interactionCreate", async (interaction: any) => {
    if (!interaction.isButton()) return;

    if (
      !interaction.customId.startsWith("accept_app_") &&
      !interaction.customId.startsWith("reject_app_")
    ) {
      return;
    }

    try {
      await handleApplicationInteraction({
        type: 3,
        data: { custom_id: interaction.customId },
        member: {
          user: { id: interaction.user.id, username: interaction.user.username },
          roles: interaction.member.roles.cache.map((r: any) => r.id),
        },
        message: { id: interaction.message.id },
        channel_id: interaction.channelId,
        guild_id: interaction.guildId,
      });

      // Send acknowledgment
      await interaction.deferReply({ ephemeral: true });
    } catch (error) {
      console.error("Error handling interaction:", error);
      if (interaction.replied) {
        await interaction.editReply({
          content: "An error occurred while processing your request.",
        });
      } else {
        await interaction.reply({
          content: "An error occurred while processing your request.",
          ephemeral: true,
        });
      }
    }
  });

  console.log("✅ Application handlers setup complete");
}
