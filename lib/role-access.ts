import type { Role } from "@/types";

export function hasAdminAccess(role: unknown): role is "admin" | "management_team" {
  return role === "admin" || role === "management_team";
}

export function hasOwnerAccess(
  role: unknown,
): role is "owner" | "admin" | "management_team" {
  return role === "owner" || hasAdminAccess(role);
}
