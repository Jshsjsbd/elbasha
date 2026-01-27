import type { VercelRequest, VercelResponse } from "@vercel/node";
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
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body as { code?: string };

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
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

    res.setHeader(
      "Set-Cookie",
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    );

    return res.status(200).json({
      success: true,
      token: sessionToken,
      user: {
        discordId: discordUser.id,
        username: discordUser.username,
        email: discordUser.email,
        avatar: createAvatarUrl(discordUser),
      },
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return res.status(500).json({
      error: "Failed to authenticate with Discord",
    });
  }
}
