/**
 * Utility to create JSON responses for React Router loaders/actions
 */
export function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers instanceof Headers
        ? Object.fromEntries(init.headers)
        : init?.headers || {}),
    },
  });
}
