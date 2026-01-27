# ⚡ Quick Reference Guide

## 🎯 30-Second Overview

You have a **production-ready Minecraft server hub** with Discord OAuth, applications system, and Discord bot integration. All code is written, just needs configuration.

## 🚀 Get Started in 3 Minutes

### Step 1: Copy Environment
```bash
cp .env.example .env
```

### Step 2: Get Discord Credentials
1. Go to https://discord.com/developers
2. Create app → Copy Client ID & Secret
3. Create Bot → Copy Bot Token
4. Add OAuth redirect: `http://localhost:5173/auth/discord/callback`

### Step 3: Configure .env
```env
VITE_DISCORD_CLIENT_ID=copy_from_discord
DISCORD_CLIENT_SECRET=copy_from_discord
DISCORD_BOT_TOKEN=copy_from_discord
DISCORD_GUILD_ID=your_server_id
DISCORD_APPLICATION_CHANNEL_ID=channel_id
DISCORD_REQUIRED_ROLE_ID=role_id
JWT_SECRET=generate_random_string_32_chars
```

### Step 4: Run
```bash
npm install
npm run dev
```

Visit: http://localhost:5173

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `app/services/discord.ts` | Discord OAuth logic |
| `app/services/bot.ts` | Discord bot embeds & roles |
| `app/services/minecraft.ts` | Server stats & username validation |
| `app/services/applications.ts` | Application forms & logic |
| `app/routes/home.tsx` | Home page with server stats |
| `app/routes/applications.tsx` | Applications listing |
| `app/routes/applications.$type.tsx` | Application form |
| `app/api/auth.ts` | Login API |
| `app/api/server-status.ts` | Stats API |
| `app/api/applications.ts` | Applications APIs |

## 🔧 Important Configuration

### Discord Server Setup
1. Right-click server → Copy Server ID → `DISCORD_GUILD_ID`
2. Create `#applications` channel → Copy Channel ID → `DISCORD_APPLICATION_CHANNEL_ID`
3. Create `@Staff` role → Copy ID → `DISCORD_REQUIRED_ROLE_ID`

### Bot Permissions
Add bot to server with this URL (replace YOUR_CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot
```

Required permissions:
- Send Messages
- Manage Roles
- Embed Links

## 📝 API Endpoints

### Status Check
```bash
curl http://localhost:5173/api/server/status
```

### Submit Application
```bash
curl -X POST http://localhost:5173/api/applications/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "staff",
    "discordId": "user_id",
    "discordUsername": "username",
    "avatarUrl": "url",
    "minecraftUsername": "PlayerName",
    "answers": {...}
  }'
```

## 🎨 Customization Quick Tips

### Change Colors (Orange Theme)
Search and replace in files:
- `from-orange-500` → `from-blue-500`
- `to-orange-600` → `to-blue-600`

### Add New Application Type
Edit `app/services/applications.ts`:
```typescript
{
  id: "newtype",
  label: "New Type",
  icon: "🎯",
  description: "..."
}
```

### Change Server Stats Source
Edit `app/services/minecraft.ts`

## 🔐 Security Essentials

- ✅ All endpoints validate user input
- ✅ JWT tokens expire after 1 hour
- ✅ Rate limiting prevents spam
- ✅ Discord role verification for moderation
- ✅ HTTPS ready (use in production)

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Discord login won't work | Check Client ID in environment |
| Applications don't appear in Discord | Check bot token & channel ID |
| Minecraft validation fails | Username is case-sensitive |
| Session lost on reload | Check browser localStorage |

## 📊 Testing Checklist

- [ ] Login with Discord
- [ ] View home page stats
- [ ] Submit application
- [ ] Check Discord #applications channel
- [ ] Click Accept button (with moderator role)
- [ ] Check user received DM
- [ ] Logout and verify session cleared

## 🚀 Deploy to Production

### Vercel (Easiest)
```bash
npm install -g vercel
vercel --prod
```

### Update Discord App
1. Go to Discord Developer Portal
2. Update OAuth Redirect URI to production URL
3. Update environment variables

### Test Live
```
https://yourdomain.com/
https://yourdomain.com/applications
```

## 📚 Full Docs

- **Setup Guide:** `SETUP_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Deployment Guide:** `DEPLOYMENT_CHECKLIST.md`

## 💬 Discord Bot Events Handled

- ✅ Application submission → Embed sent
- ✅ Accept button → Role assigned, DM sent
- ✅ Reject button → DM sent, buttons disabled
- ✅ Non-moderator click → Permission error

## 🎯 What Works Now

| Feature | Status |
|---------|--------|
| Discord OAuth | ✅ Complete |
| Session Management | ✅ Complete |
| Server Stats | ✅ Complete |
| Application Forms | ✅ Complete |
| Form Validation | ✅ Complete |
| Discord Embeds | ✅ Complete |
| Role Assignment | ✅ Complete |
| DM Notifications | ✅ Complete |
| Security | ✅ Complete |

## 🔜 Optional Enhancements

- [ ] Firebase Firestore integration
- [ ] Email notifications
- [ ] Application timeline tracking
- [ ] Admin dashboard
- [ ] Minecraft plugin for auto roles
- [ ] Appeal system
- [ ] Analytics dashboard

## 📞 Need Help?

1. Check console for errors: `F12`
2. Read `SETUP_GUIDE.md` for detailed setup
3. Check Discord Developer Docs
4. Verify all environment variables are set

## ✨ You're All Set!

The entire system is ready to use. Just configure your Discord credentials and deploy! 🎉

---

**Questions? Check the documentation files or Discord Developer Portal docs.**
