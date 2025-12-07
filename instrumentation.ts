export function register() {
  // No-op for initialization
}

export const onRequestError = async (
  err: Error,
  request: { headers: { cookie?: string | string[] } },
  _context: unknown
) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getPostHogServer } = await import("./src/lib/posthog-server");
    const posthog = getPostHogServer();

    let distinctId: string | undefined = undefined;

    if (request.headers.cookie) {
      // Normalize multiple cookie arrays to string
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join("; ")
        : request.headers.cookie;

      const postHogCookieMatch = cookieString.match(
        /ph_phc_.*?_posthog=([^;]+)/
      );

      if (postHogCookieMatch && postHogCookieMatch[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
          const postHogData = JSON.parse(decodedCookie);
          distinctId = postHogData.distinct_id;
        } catch (e) {
          console.error("Error parsing PostHog cookie:", e);
        }
      }
    }

    console.log("[PostHog Server] Capturing exception:", err.message);
    posthog.captureException(err, distinctId);
    await posthog.flush();
  }
};
