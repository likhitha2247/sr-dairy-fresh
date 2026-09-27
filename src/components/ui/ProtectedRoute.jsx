import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <div className="container-page py-20 text-center text-sm text-ink/60">Loading your account…</div>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (adminOnly && !isAdmin) return <Navigate to="/account" replace />
  return children
}
