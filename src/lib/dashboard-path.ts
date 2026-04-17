/**
 * Returns the correct dashboard path for a given user role.
 */
export function getDashboardPath(role?: string | null): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "OWNER":
      return "/owner";
    case "TRAINER":
      return "/trainer";
    case "USER":
    default:
      return "/dashboard";
  }
}
