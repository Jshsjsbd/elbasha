import { createBrowserRouter } from "react-router-dom";
import Root, { ErrorBoundary } from "./root";

import Home from "./routes/home";
import Store from "./routes/store";
import Success from "./routes/success";
import Cancel from "./routes/cancel";
import Applications from "./routes/applications";
import ApplicationsType from "./routes/applications.$type";
import AuthDiscordCallback from "./routes/auth.discord.callback";
import Profile from "./routes/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "store", element: <Store /> },
      { path: "success", element: <Success /> },
      { path: "cancel", element: <Cancel /> },
      { path: "applications", element: <Applications /> },
      { path: "applications/:type", element: <ApplicationsType /> },
      { path: "auth/discord/callback", element: <AuthDiscordCallback /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);
