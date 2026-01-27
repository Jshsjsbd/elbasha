import { json, type RequestHandler } from "react-router";
import {
  exchangeDiscordCode,
  getDiscordUser,
  isUserInGuild,
  createSessionToken,
  createAvatarUrl,
} from "../services/discord";

/**
 * POST /api/auth/discord-callback
 * Exchange Discord authorization code for session token
 */
export const POST: RequestHandler = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { code } = await request.json();

    if (!code) {
      return json({ error: "Authorization code is required" }, { status: 400 });
    }

    // Exchange code for access token
    const tokenData = await exchangeDiscordCode(code);

    // Get user information
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Check if user is in required guild
    const inGuild = await isUserInGuild(
      discordUser.id,
      tokenData.access_token
    );

    if (!inGuild) {
      return json(
        {
          error: "You must be a member of our Discord server to access this",
        },
        { status: 403 }
      );
    }

    // Create session token
    const sessionToken = createSessionToken({
      id: crypto.randomUUID?.() || Math.random().toString(36),
      discordId: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
      email: discordUser.email,
    });

    return json(
      {
        success: true,
        token: sessionToken,
        user: {
          discordId: discordUser.id,
          username: discordUser.username,
          email: discordUser.email,
          avatar: createAvatarUrl(discordUser),
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
        },
      }
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    return json(
      { error: "Failed to authenticate with Discord" },
      { status: 500 }
    );
  }
};
