import axios from "axios";
import jwt from "jsonwebtoken";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
  mfa_enabled?: boolean;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface SessionUser {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  email?: string;
  token?: string;
  expiresAt?: number;
}

/**
 * Get Discord OAuth2 authorization URL
 */
export function getDiscordAuthorizationUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const scope = "identify email guilds";

  return `${DISCORD_API_BASE}/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
}

/**
 * Exchange Discord code for access token
 */
export async function exchangeDiscordCode(
  code: string
): Promise<DiscordTokenResponse> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  const response = await axios.post<DiscordTokenResponse>(
    `${DISCORD_API_BASE}/oauth2/token`,
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}

/**
 * Get Discord user information using access token
 */
export async function getDiscordUser(
  accessToken: string
): Promise<DiscordUser> {
  const response = await axios.get<DiscordUser>(
    `${DISCORD_API_BASE}/users/@me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

/**
 * Check if user is member of guild
 */
export async function isUserInGuild(
  userId: string,
  accessToken: string
): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;

  try {
    const response = await axios.get(
      `${DISCORD_API_BASE}/users/@me/guilds`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const guilds = response.data as Array<{ id: string }>;
    return guilds.some((guild) => guild.id === guildId);
  } catch {
    return false;
  }
}

/**
 * Get Discord user avatar URL
 */
export function getDiscordAvatarUrl(
  userId: string,
  avatarHash: string | null
): string {
  if (!avatarHash) {
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}

/**
 * Create JWT session token
 */
export function createSessionToken(user: SessionUser): string {
  const secret = process.env.JWT_SECRET || "default-secret-change-me";
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const expiresIn = parseInt(process.env.JWT_EXPIRY || "3600000");

  const token = jwt.sign(
    {
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    },
    secret as string,
    {
      expiresIn: Math.floor(expiresIn / 1000), // Convert to seconds
    }
  );

  return token;
}

/**
 * Verify and decode JWT token
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const secret = process.env.JWT_SECRET || "default-secret-change-me";
    if (!secret) {
      return null;
    }
    const decoded = jwt.verify(token, secret as string) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Create avatar URL from Discord user
 */
export function createAvatarUrl(user: DiscordUser): string {
  return getDiscordAvatarUrl(user.id, user.avatar);
}
