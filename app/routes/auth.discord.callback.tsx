import * as Route from "react-router";
import { redirect } from "react-router";
import { getDiscordAuthorizationUrl } from "../services/discord";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return redirect("/?error=" + encodeURIComponent(error));
  }

  if (!code) {
    return redirect("/?error=no_code");
  }

  // Call the auth API
  try {
    const response = await fetch(
      new URL("/api/auth/discord-callback", request.url).href,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return redirect("/?error=" + encodeURIComponent(data.error));
    }

    const data = await response.json();

    // Redirect to home with token in session
    return redirect("/", {
      headers: {
        "Set-Cookie": `session=${data.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
      },
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/?error=auth_failed");
  }
}

export default function AuthCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
