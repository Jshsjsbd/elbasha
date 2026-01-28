import { Routes as RRRoutes, Route } from "react-router-dom";
import Home from "./routes/home";
import Store from "./routes/store";
import Success from "./routes/success";
import Cancel from "./routes/cancel";
import Applications from "./routes/applications";
import ApplicationsType from "./routes/applications.$type";
import AuthDiscordCallback from "./routes/auth.discord.callback";
import Profile from "./routes/profile";

export default function AppRoutes() {
  return (
    <RRRoutes>
      <Route index element={<Home />} />
      <Route path="store" element={<Store />} />
      <Route path="success" element={<Success />} />
      <Route path="cancel" element={<Cancel />} />
      <Route path="applications" element={<Applications />} />
      <Route path="applications/:type" element={<ApplicationsType />} />
      <Route path="auth/discord/callback" element={<AuthDiscordCallback />} />
      <Route path="profile" element={<Profile />} />
    </RRRoutes>
  );
}
