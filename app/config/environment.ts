/**
 * Environment configuration validator
 * Checks that all required environment variables are set
 */

const requiredEnvVars = [
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_BOT_TOKEN",
  "DISCORD_GUILD_ID",
  "DISCORD_APPLICATION_CHANNEL_ID",
  "DISCORD_REQUIRED_ROLE_ID",
  "JWT_SECRET",
];

const optionalEnvVars = [
  "MINECRAFT_SERVER_IP",
  "MINECRAFT_SERVER_PORT",
  "MINECRAFT_RCON_PASSWORD",
  "MINECRAFT_RCON_PORT",
];

export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value === "your_" + varName.toLowerCase()) {
      errors.push(
        `Missing or unconfigured required environment variable: ${varName}`
      );
    }
  });

  // Check optional variables
  optionalEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      warnings.push(
        `Optional environment variable not set: ${varName} (some features may not work)`
      );
    }
  });

  // Check JWT_SECRET strength (should be long)
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push(
      `JWT_SECRET is weak (${jwtSecret.length} chars). Recommended: 32+ characters`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvironmentStatus(): void {
  const { valid, errors, warnings } = validateEnvironment();

  console.log("\n🔐 Environment Configuration Check:");
  console.log("=====================================\n");

  if (errors.length > 0) {
    console.error("❌ ERRORS (Must fix):");
    errors.forEach((err) => console.error(`   • ${err}`));
    console.log();
  }

  if (warnings.length > 0) {
    console.warn("⚠️  WARNINGS (Should fix):");
    warnings.forEach((warn) => console.warn(`   • ${warn}`));
    console.log();
  }

  if (valid && warnings.length === 0) {
    console.log("✅ All environment variables are properly configured!\n");
  } else if (valid && warnings.length > 0) {
    console.log("✅ Required variables configured (with warnings above)\n");
  } else {
    console.error(
      "❌ Configuration incomplete. Fix errors above before running.\n"
    );
    process.exit(1);
  }
}

export const CONFIG = {
  // Discord
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    botToken: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    applicationChannelId: process.env.DISCORD_APPLICATION_CHANNEL_ID,
    requiredRoleId: process.env.DISCORD_REQUIRED_ROLE_ID,
    redirectUri:
      process.env.DISCORD_REDIRECT_URI ||
      "http://localhost:5173/auth/discord/callback",
  },

  // Minecraft
  minecraft: {
    serverIp: process.env.MINECRAFT_SERVER_IP || "localhost",
    serverPort: process.env.MINECRAFT_SERVER_PORT || "25565",
    rconPassword: process.env.MINECRAFT_RCON_PASSWORD || "",
    rconPort: process.env.MINECRAFT_RCON_PORT || "25575",
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-in-production",
    expiry: parseInt(process.env.JWT_EXPIRY || "3600000"),
  },

  // App
  app: {
    url: process.env.APP_URL || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // Security
  security: {
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || "900000"
    ),
    rateLimitMaxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || "100"
    ),
  },
};

// Client-side config (safe to expose)
export const CLIENT_CONFIG = {
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordRedirectUri:
    process.env.DISCORD_REDIRECT_URI ||
    "http://localhost:5173/auth/discord/callback",
  appUrl: process.env.APP_URL || "http://localhost:5173",
};
