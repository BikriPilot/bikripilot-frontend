export function safeRedirect(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;
}

export function getAuthenticatedRedirect(
  value: string | null | undefined,
  platformRole?: string,
  hasShop = false,
) {
  const defaultTarget =
    (platformRole === "SUPER_ADMIN" || platformRole === "SUPPORT") && !hasShop
      ? "/admin"
      : "/dashboard";
  const target = safeRedirect(value, defaultTarget);
  if (
    target.startsWith("/login") ||
    target.startsWith("/register") ||
    target.startsWith("/forgot-password") ||
    target.startsWith("/reset-password")
  ) {
    return defaultTarget;
  }
  return target;
}

