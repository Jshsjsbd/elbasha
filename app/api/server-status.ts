import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getMinecraftServerStatus,
  getTopPlayers,
} from "../services/minecraft";

/**
 * GET /api/server/status
 * Get current server status and stats
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [serverStatus, topPlayers] = await Promise.all([
      getMinecraftServerStatus(),
      getTopPlayers(10),
    ]);

    if (!serverStatus) {
      return res.status(503).json({
        online: false,
        players: { online: 0, max: 0 },
        message: "Unable to fetch server status",
      });
    }

    res.setHeader("Cache-Control", "public, max-age=30");
    return res.status(200).json({
      online: serverStatus.online,
      players: serverStatus.players,
      version: serverStatus.version,
      description: serverStatus.description,
      topPlayers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Server status error:", error);
    return res.status(500).json({
      error: "Failed to fetch server status",
    });
  }
}
