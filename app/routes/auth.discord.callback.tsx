import * as Route from "react-router";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";

export default function DiscordCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      navigate("/?error=" + encodeURIComponent(error));
      return;
    }

    if (!code) {
      navigate("/?error=no_code");
      return;
    }

    // Call the auth API
    fetch("/api/auth/discord-callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          navigate("/?error=" + encodeURIComponent(data.error));
        } else if (data.token) {
          localStorage.setItem("userSession", JSON.stringify(data));
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("Auth error:", err);
        navigate("/?error=auth_failed");
      });
  }, [searchParams, navigate]);

  return <div>Processing Discord login...</div>;
}
