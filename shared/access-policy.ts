export const staffRoles = ["admin", "manager", "employee", "accountant", "programmer", "sales"];
export function canOpenWorkspace(role: string, path: string): boolean {
  if (path.startsWith("/admin")) return ["admin", "manager"].includes(role);
  if (path.startsWith("/delivery")) return ["admin", "manager", "delivery"].includes(role);
  if (!path.startsWith("/employee")) return true;
  if (["admin", "manager"].includes(role)) return true;
  if (!staffRoles.includes(role)) return false;
  if (/^\/employee\/(transfers|donations)(\/|$)/.test(path)) return ["accountant", "employee"].includes(role);
  if (/^\/employee\/applications(\/|$)/.test(path)) return role === "employee";
  if (/^\/employee\/tasks(\/|$)/.test(path)) return role === "programmer";
  if (/^\/employee\/(content|posters)(\/|$)/.test(path)) return ["programmer", "sales"].includes(role);
  return true;
}

export function canReadFinancialRecord(user: { id?: unknown; _id?: unknown; userId?: unknown; role?: string }, record: { [key: string]: unknown; userId?: unknown }): boolean {
  if (["admin", "manager", "accountant"].includes(user.role || "")) return true;
  const id = String(user.userId || user.id || user._id || "");
  return !!id && !!record.userId && id === String(record.userId);
}
