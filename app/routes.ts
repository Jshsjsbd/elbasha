import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Index route redirects to home
  index("routes/home.tsx"),
  
  // Main routes
//   route("home", "routes/home.tsx"),
  route("profile", "routes/profile.tsx"),
  route("store", "routes/store.tsx"),
  route("success", "routes/success.tsx"),
  route("cancel", "routes/cancel.tsx"),
  
  // Applications with nested route
  route("applications", "routes/applications.tsx", [
    route(":type", "routes/applications.$type.tsx"),
  ]),
  
  // Auth callback
  route("auth/discord/callback", "routes/auth.discord.callback.tsx"),
] satisfies RouteConfig;