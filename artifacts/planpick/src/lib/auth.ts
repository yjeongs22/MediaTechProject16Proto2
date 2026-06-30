export interface CurrentUser {
  userId: string;
  name?: string;
}

export function getCurrentUser(): CurrentUser | null {
  try {
    return JSON.parse(localStorage.getItem("planpickUser") || "null") as CurrentUser | null;
  } catch {
    return null;
  }
}

export function getCurrentUserName() {
  const user = getCurrentUser();
  return user?.name || user?.userId || "";
}

export function isLoggedIn() {
  return Boolean(getCurrentUser());
}
