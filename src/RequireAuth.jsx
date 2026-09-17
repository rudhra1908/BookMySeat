import { useAuth } from './AuthContext';

/**
 * Wrap any page that requires a signed-in user (and optionally a specific role).
 *
 * <RequireAuth role="admin"><AdminDashboard /></RequireAuth>
 */
export default function RequireAuth({ role, children, fallback }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center font-mono text-sm text-dim animate-pulse">
        loading…
      </div>
    );
  }

  if (!user) {
    return (
      fallback ?? (
        <div className="min-h-screen bg-ink flex items-center justify-center font-mono text-sm text-dim">
          please sign in.
        </div>
      )
    );
  }

  if (role && user.role !== role) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center font-mono text-sm text-magenta">
        ⚠ you don't have permission to view this page.
      </div>
    );
  }

  return children;
}
