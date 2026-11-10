export function hasAdminAccess(role: unknown): role is "admin" | "management_team" {
  return role === "admin" || role === "management_team";
}

export function hasFullAdminAccess(role: unknown): role is "admin" {
  return role === "admin";
}

export function canAccessManagementRoute(
  role: unknown,
  pathname: string,
): boolean {
  if (hasFullAdminAccess(role)) return true;
  if (role !== "management_team") return false;
  return ["/admin", "/admin/kyc", "/admin/messages"].includes(pathname);
}

export function hasOwnerAccess(
  role: unknown,
): role is "owner" | "admin" {
  return role === "owner" || hasFullAdminAccess(role);
}
