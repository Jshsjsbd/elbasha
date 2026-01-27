# 🚀 Deployment Checklist

## Pre-Deployment Verification

### Environment Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Set `VITE_DISCORD_CLIENT_ID` (get from Discord Developer Portal)
- [ ] Set `DISCORD_CLIENT_SECRET` (get from Discord Developer Portal)
- [ ] Set `DISCORD_BOT_TOKEN` (copy full token from bot section)
- [ ] Set `DISCORD_GUILD_ID` (right-click server → Copy Server ID)
- [ ] Set `DISCORD_APPLICATION_CHANNEL_ID` (right-click channel → Copy Channel ID)
- [ ] Set `DISCORD_REQUIRED_ROLE_ID` (right-click role → Copy Role ID)
- [ ] Set `JWT_SECRET` to strong random string (min 32 chars)
- [ ] Set `NODE_ENV=production` for production deployments
- [ ] Updated `VITE_DISCORD_REDIRECT_URI` to production domain

### Discord Application Setup
- [ ] Created application at Discord Developer Portal
- [ ] Created bot and copied token
- [ ] Configured OAuth2 redirect URIs
- [ ] Added all required intents (GUILDS, GUILD_MEMBERS, MESSAGE_CONTENT)
- [ ] Invited bot to server with correct permissions:
  - [ ] Send Messages
  - [ ] Embed Links
  - [ ] Read Message History
  - [ ] Manage Roles
  - [ ] Read Messages/View Channels

### Discord Server Setup
- [ ] Created #applications channel for application embeds
- [ ] Created moderator/staff role for reviewing applications
- [ ] Set up roles to assign to accepted applicants
- [ ] Bot has permission to assign roles

### Application Testing (Local)
- [ ] Installed dependencies: `npm install`
- [ ] Dev server runs: `npm run dev`
- [ ] Discord login works
- [ ] Session persists after page reload
- [ ] Home page loads server stats
- [ ] Applications page loads
- [ ] Application form submits successfully
- [ ] Application appears in Discord channel
- [ ] Accept/Reject buttons work (with moderator role)
- [ ] Rejection sends DM to user
- [ ] Acceptance sends DM to user
- [ ] User profile page shows logged-in user
- [ ] Logout clears session
- [ ] Form validation works (empty fields rejected)
- [ ] Minecraft username validation works
- [ ] Non-moderators cannot review applications

### Production Deployment Steps

#### 1. Build Application
```bash
npm run build
npm run typecheck  # Ensure no TypeScript errors
npm run security:audit  # Check for vulnerabilities
```

#### 2. Environment Variables (Production)
```bash
# Update .env with production values
VITE_DISCORD_CLIENT_ID=prod_client_id
DISCORD_CLIENT_SECRET=prod_secret
VITE_DISCORD_REDIRECT_URI=https://yourdomain.com/auth/discord/callback
DISCORD_BOT_TOKEN=bot_token
DISCORD_GUILD_ID=guild_id
DISCORD_APPLICATION_CHANNEL_ID=channel_id
DISCORD_REQUIRED_ROLE_ID=role_id
JWT_SECRET=very_long_random_secret_at_least_32_chars
NODE_ENV=production
```

#### 3. Secure Deployment
- [ ] Use HTTPS only (required for Discord OAuth)
- [ ] Update DNS if using custom domain
- [ ] Set secure cookies:
  - [ ] HttpOnly flag
  - [ ] Secure flag (HTTPS only)
  - [ ] SameSite=Strict

#### 4. Deploy to Host
- [ ] Vercel: Push to GitHub and connect
- [ ] Netlify: Push to GitHub and connect
- [ ] Self-hosted: Run `npm start` on server
- [ ] Docker: Build image and deploy container

Example Vercel deployment:
```bash
npm install -g vercel
vercel --prod
```

#### 5. Post-Deployment Verification
- [ ] Website loads without errors
- [ ] Discord login works
- [ ] Session persists across page reloads
- [ ] Applications submit successfully
- [ ] Discord embeds appear in channel
- [ ] Moderators can review applications
- [ ] Users receive DM notifications
- [ ] No console errors in DevTools

### Performance Optimization
- [ ] Enable CSS minification
- [ ] Enable JavaScript minification
- [ ] Enable image optimization
- [ ] Setup CDN for assets
- [ ] Enable gzip compression on server

### Security Hardening
- [ ] Set CSP headers
- [ ] Set CORS headers
- [ ] Enable rate limiting on production
- [ ] Use strong JWT secret
- [ ] Enable bot message content intent (Discord)
- [ ] Restrict API access with authentication
- [ ] Monitor for suspicious activity
- [ ] Setup error tracking (Sentry/LogRocket)
- [ ] Enable HTTPS only
- [ ] Setup HSTS header

### Monitoring & Logging
- [ ] Setup error tracking
- [ ] Setup application monitoring
- [ ] Setup Discord alerts for errors
- [ ] Setup database backups
- [ ] Monitor application submissions
- [ ] Setup analytics

### Database (If Using Firestore)
- [ ] Created Firestore project
- [ ] Created "applications" collection
- [ ] Set appropriate security rules
- [ ] Tested data persistence
- [ ] Setup automated backups
- [ ] Restricted access to authenticated users

### Backup & Recovery
- [ ] Setup automatic backups
- [ ] Test backup restoration
- [ ] Document recovery procedure
- [ ] Store backup credentials securely

### Maintenance
- [ ] Setup dependency update schedule
- [ ] Monitor security advisories
- [ ] Regular security audits
- [ ] Document deployment procedures
- [ ] Create runbook for common issues

## Monitoring URLs

After deployment, monitor these:
- Dashboard: `https://yourdomain.com/`
- Applications: `https://yourdomain.com/applications`
- API Status: `https://yourdomain.com/api/server/status`
- Bot logs: Check Discord bot's audit log

## Rollback Plan

If deployment fails:

1. **Immediate Actions**
   ```bash
   git revert <commit-hash>
   npm run build
   # Re-deploy previous working version
   ```

2. **Notify Users**
   - Post in Discord server explaining issue
   - Provide status update

3. **Investigation**
   - Check error logs
   - Review recent changes
   - Test in staging environment

4. **Recovery**
   - Fix issues in staging
   - Re-test thoroughly
   - Deploy to production

## Post-Deployment Checklist

- [ ] Monitor error rates for 24 hours
- [ ] Check user feedback in Discord
- [ ] Monitor server logs
- [ ] Verify all features working
- [ ] Test on different devices/browsers
- [ ] Confirm Discord notifications working
- [ ] Verify email/DM notifications sent
- [ ] Check database storage
- [ ] Monitor API response times
- [ ] Verify security headers present

## Common Deployment Issues

### Discord OAuth Not Working
**Solution:** 
- Verify redirect URI matches exactly in Discord Portal
- Clear browser cache and cookies
- Ensure HTTPS is used in production

### Applications Not Sending to Discord
**Solution:**
- Verify bot token is correct
- Check bot has permission to send messages
- Verify channel ID is correct
- Check bot is in server

### Minecraft Username Validation Fails
**Solution:**
- Ensure internet connection is working
- Check Mojang API status
- Username must be exact case

### High Error Rates
**Solution:**
- Check error logs
- Review recent code changes
- Check environment variables
- Verify API endpoints are accessible

## Support Contacts

- Discord Support: https://support.discord.com
- Minecraft API Issues: https://wiki.vg
- Vercel Support: https://vercel.com/support
- React Router Docs: https://reactrouter.com

## Post-Launch Enhancements

- [ ] Add email verification for applications
- [ ] Add application status tracking UI
- [ ] Add appeal system for rejections
- [ ] Add analytics dashboard
- [ ] Add Discord webhook alerts
- [ ] Add audit logging
- [ ] Add 2FA for moderators
- [ ] Add advanced application filtering
- [ ] Add bulk operations for moderators
- [ ] Add custom email templates

---

**Remember: Before deploying to production, always test thoroughly in a staging environment!**

For questions or issues, check the SETUP_GUIDE.md and IMPLEMENTATION_SUMMARY.md files.
