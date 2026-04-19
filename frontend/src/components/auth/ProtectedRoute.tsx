import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function FullPageMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="glass-card-strong max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">Authentication Required</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isConfigured, isLoading, session } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    return <FullPageMessage message="Set your Supabase URL and publishable key before using protected pages." />;
  }

  if (isLoading) {
    return <FullPageMessage message="Checking your session..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <FullPageMessage message="Checking your session..." />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
