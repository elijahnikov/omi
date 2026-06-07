import { httpAction } from "./_generated/server";

export const healthHandler = httpAction(() => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "omi-backend",
      timestamp: Date.now(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
