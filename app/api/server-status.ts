import { json, type RequestHandler } from "react-router";
import {
  getMinecraftServerStatus,
  getTopPlayers,
} from "../services/minecraft";

/**
 * GET /api/server/status
 * Get current server status and stats
 */
export const GET: RequestHandler = async () => {
  try {
    const [serverStatus, topPlayers] = await Promise.all([
      getMinecraftServerStatus(),
      getTopPlayers(10),
    ]);

    if (!serverStatus) {
      return json(
        {
          online: false,
          players: { online: 0, max: 0 },
          message: "Unable to fetch server status",
        },
        { status: 503 }
      );
    }

    return json(
      {
        online: serverStatus.online,
        players: serverStatus.players,
        version: serverStatus.version,
        description: serverStatus.description,
        topPlayers,
        lastUpdated: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30", // Cache for 30 seconds
        },
      }
    );
  } catch (error) {
    console.error("Server status error:", error);
    return json(
      { error: "Failed to fetch server status" },
      { status: 500 }
    );
  }
};
