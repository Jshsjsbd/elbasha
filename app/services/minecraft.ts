import axios from "axios";

export interface MinecraftServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
    sample?: Array<{ name: string; id: string }>;
  };
  version: {
    name: string;
    protocol: number;
  };
  description: string;
  favicon?: string;
  latency: number;
  motd?: string;
}

export interface PlayerStats {
  username: string;
  uuid: string;
  playtime: number; // in hours
  lastSeen: string;
  level?: number;
}

/**
 * Get Minecraft server status using server.js query
 */
export async function getMinecraftServerStatus(): Promise<MinecraftServerStatus | null> {
  try {
    const serverIp = process.env.MINECRAFT_SERVER_IP || "localhost";
    const serverPort = process.env.MINECRAFT_SERVER_PORT || "25565";

    // Using mcapi.us for server status (public API, no auth needed)
    const response = await axios.get(
      `https://api.mcstatus.io/v2/status/java/${serverIp}:${serverPort}`,
      {
        timeout: 10000,
      }
    );

    if (response.data.online) {
      return {
        online: response.data.online,
        players: {
          online: response.data.players.online,
          max: response.data.players.max,
        },
        version: {
          name: response.data.version.name_clean,
          protocol: response.data.version.protocol,
        },
        description: response.data.motd?.clean?.[0] || "Minecraft Server",
        latency: 0,
      };
    }

    return {
      online: false,
      players: { online: 0, max: 0 },
      version: { name: "Unknown", protocol: 0 },
      description: "Server is offline",
      latency: 0,
    };
  } catch (error) {
    console.error("Error fetching server status:", error);
    return null;
  }
}

/**
 * Get top players by playtime (would be fetched from your database)
 * This is a placeholder - integrate with your actual player database
 */
export async function getTopPlayers(limit: number = 10): Promise<PlayerStats[]> {
  try {
    // TODO: Replace with your actual database query
    // This should fetch player stats from your Minecraft server database
    // or from an API that tracks player playtime

    // Placeholder data structure
    const topPlayers: PlayerStats[] = [
      {
        username: "Player1",
        uuid: "00000000-0000-0000-0000-000000000001",
        playtime: 1250,
        lastSeen: new Date().toISOString(),
        level: 45,
      },
      {
        username: "Player2",
        uuid: "00000000-0000-0000-0000-000000000002",
        playtime: 950,
        lastSeen: new Date().toISOString(),
        level: 38,
      },
      {
        username: "Player3",
        uuid: "00000000-0000-0000-0000-000000000003",
        playtime: 850,
        lastSeen: new Date().toISOString(),
        level: 35,
      },
    ];

    return topPlayers.slice(0, limit);
  } catch (error) {
    console.error("Error fetching top players:", error);
    return [];
  }
}

/**
 * Validate Minecraft username (check if player exists)
 */
export async function validateMinecraftUsername(
  username: string
): Promise<{ valid: boolean; uuid?: string; name?: string }> {
  try {
    // Using Mojang API to validate username
    const response = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${username}`,
      {
        timeout: 5000,
      }
    );

    return {
      valid: true,
      uuid: response.data.id,
      name: response.data.name,
    };
  } catch (error) {
    return {
      valid: false,
    };
  }
}

/**
 * Get player's current skin and profile information
 */
export async function getPlayerProfile(
  username: string
): Promise<{ skinUrl: string; uuid: string } | null> {
  try {
    const validation = await validateMinecraftUsername(username);

    if (!validation.valid || !validation.uuid) {
      return null;
    }

    // Generate skin URL
    const skinUrl = `https://crafatar.com/avatars/${validation.uuid}?overlay=true`;

    return {
      skinUrl,
      uuid: validation.uuid,
    };
  } catch (error) {
    console.error("Error fetching player profile:", error);
    return null;
  }
}
