import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // route("dashboard", "routes/dashboard.tsx"),
  // route("level/:level", "routes/level.$level.tsx"),
  // route("leaderboard", "routes/scoreboard.tsx"),
  // route("profile", "routes/profile.tsx"),
  // route("signup", "routes/signup.tsx"),
  // route("login", "routes/login.tsx"),
  // route("reset-password", "routes/resetpassword.tsx"),
  // route("email-verify", "routes/verifyemail.tsx"),
  route("noturbusiness1", "routes/noturbusiness1.tsx")
  // route("noturbusiness2", "routes/noturbusiness2.tsx")
] satisfies RouteConfig;
