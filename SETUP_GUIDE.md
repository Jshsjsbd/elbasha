# Mystic Network - Complete Setup Guide

## 🎮 Overview

This is a complete Minecraft server hub application with:
- Discord OAuth 2.0 authentication
- Server stats and player leaderboards
- Application/staff application system
- Discord bot integration for application reviews
- Complete security implementation
- Beautiful Minecraft-themed UI

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Discord Bot Token
- Discord Server ID (Guild ID)
- Discord OAuth Client ID & Secret
- Minecraft server (optional, for real stats)

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
cd elbasha
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### 3. Configure Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 > General and get your Client ID and Client Secret
4. Add redirect URI: `http://localhost:5173/auth/discord/callback`
5. Copy the values to `.env`:

```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:5173/auth/discord/callback
```

### 4. Configure Discord Bot

1. In Developer Portal, go to your application
2. Create a Bot
3. Copy the token to `.env`:

```env
DISCORD_BOT_TOKEN=your_bot_token
```

4. Configure bot permissions and intents:
   - Intents: MESSAGE_CONTENT, GUILD_MEMBERS, GUILDS
   - Permissions: SEND_MESSAGES, MANAGE_ROLES, READ_MESSAGE_HISTORY

5. Add bot to your server with this URL (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=268435456&scope=bot
```

### 5. Discord Server Setup

1. Get your server ID (Guild ID)
2. Create a channel for applications (e.g., #applications)
3. Create roles for staff applications to grant

```env
DISCORD_GUILD_ID=your_server_id
DISCORD_APPLICATION_CHANNEL_ID=your_channel_id
DISCORD_REQUIRED_ROLE_ID=moderator_role_id
```

### 6. JWT Secret

Generate a strong secret for JWT tokens:

```env
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=3600000
```

### 7. Minecraft Server (Optional)

```env
MINECRAFT_SERVER_IP=your_server_ip
MINECRAFT_SERVER_PORT=25565
MINECRAFT_RCON_PASSWORD=your_rcon_password
MINECRAFT_RCON_PORT=25575
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm start
```

## 🔐 Security Features

- **Discord OAuth 2.0**: Secure authentication
- **JWT Tokens**: Session management with expiration
- **Rate Limiting**: Prevents abuse (5 login attempts per 5 min)
- **Input Validation**: All user inputs validated and sanitized
- **CSRF Protection**: Token-based CSRF protection
- **XSS Prevention**: HTML entity encoding
- **Secure Headers**: CSP, X-Frame-Options, etc.
- **HTTPS Ready**: Secure cookie handling
- **SQL Injection Prevention**: Query parameterization
- **Role-Based Access Control**: Application review authorization

## 📝 API Endpoints

### Authentication
- `POST /api/auth/discord-callback` - Exchange Discord code for session

### Server Status
- `GET /api/server/status` - Get server stats and top players

### Applications
- `GET /api/applications/types` - Get all application types
- `GET /api/applications/:type/form` - Get specific application form
- `POST /api/applications/submit` - Submit new application
- `GET /api/applications/:id` - Get application details
- `POST /api/applications/:id/review` - Review application (Accept/Reject)

## 🤖 Discord Bot Integration

The bot automatically:
1. Sends embeds when users submit applications
2. Provides Accept/Reject buttons (mod only)
3. Disables buttons after review
4. Sends DM notifications to applicants
5. Assigns roles on acceptance

## 📚 Application Form Fields

### Standard Fields (All Applications)
- Minecraft Username (validated against Mojang API)

### Customizable Fields by Type
- **Staff**: Experience, Timezone, Hours, Why join
- **Media**: Platforms, Followers, Content type, Portfolio
- **YouTube**: Channel link, Subscribers, Avg views, Upload frequency
- **Streamer**: Platform, Followers, Avg viewers, Schedule
- **Moderator**: Experience, Availability, Timezone, Motivation

## 🔄 Application Workflow

1. User logs in with Discord
2. Navigates to Applications
3. Selects application type
4. Fills out form with Minecraft username (validated)
5. Submits application
6. Discord bot sends embed to #applications
7. Moderator with required role can:
   - Click "Accept" → User gets role + DM notification
   - Click "Reject" → User gets rejection DM + role denial
8. Buttons become disabled after review

## 📦 Database (Firebase)

Currently uses in-memory storage for applications. To integrate with Firebase:

1. Initialize Firestore in `app/services/applications.ts`
2. Store applications in collection: `applications`
3. Structure:
```
{
  id: string,
  type: string,
  discordId: string,
  minecraftUsername: string,
  answers: {...},
  status: "pending|accepted|rejected",
  submittedAt: timestamp,
  reviewedAt: timestamp,
  reviewedBy: string
}
```

## 🎨 UI Customization

- Colors: Edit Tailwind classes (orange theme)
- Logos: Replace in `app/assets/`
- Server name: Update "MYSTIC NETWORK" throughout
- Discord link: Update in Footer component

## 🐛 Troubleshooting

### Discord Login Not Working
- Check Client ID in Header component
- Verify redirect URI matches in Discord Portal
- Ensure bot has correct permissions

### Applications Not Posting to Discord
- Verify bot token is correct
- Check bot has permission to send messages in channel
- Ensure Channel ID is correct

### Minecraft Username Validation Fails
- Check Mojang API is accessible
- Username must be exact (case-sensitive)
- Player must have played before

### Rate Limiting Issues
- Check RATE_LIMIT_WINDOW_MS in environment
- Clear browser localStorage if needed

## 📞 Support

For issues or questions:
1. Check Discord Developer Portal documentation
2. Verify all environment variables are set
3. Check console for error messages
4. Contact support through Discord

## 📄 License

All rights reserved - Mystic Network

---

**Made with ❤️ for Minecraft communities**
