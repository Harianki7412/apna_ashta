export function hasAdminAccess(role: unknown): role is "admin" | "management_team" {
  return role === "admin" || role === "management_team";
}

export function hasFullAdminAccess(role: unknown): role is "admin" {
  return role === "admin";
}

export function hasManagementTeamAccess(
  role: unknown,
): role is "management_team" {
  return role === "management_team";
}

function isWithinRoute(pathname: string, route: string): boolean {
  if (route === "/admin") return pathname === route;
  return pathname === route || pathname.startsWith(`${route}/`);
}

const MANAGEMENT_TEAM_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/kyc",
  "/admin/states",
  "/admin/cities",
  "/admin/locations",
  "/admin/messages",
  "/admin/settings",
];

const MANAGEMENT_TEAM_ONLY_ROUTES = [
  "/admin/kyc",
  "/admin/states",
  "/admin/cities",
  "/admin/locations",
];

export function canAccessManagementRoute(
  role: unknown,
  pathname: string,
): boolean {
  if (hasFullAdminAccess(role)) {
    return !MANAGEMENT_TEAM_ONLY_ROUTES.some((route) =>
      isWithinRoute(pathname, route),
    );
  }
  if (hasManagementTeamAccess(role)) {
    return MANAGEMENT_TEAM_ROUTES.some((route) =>
      isWithinRoute(pathname, route),
    );
  }
  return false;
}

export function hasOwnerAccess(
  role: unknown,
): role is "owner" | "admin" {
  return role === "owner" || hasFullAdminAccess(role);
}
