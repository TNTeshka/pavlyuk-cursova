import { Navigate } from "react-router-dom";

import { getToken } from "../api";

export function Protected({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
