import { SignInCard } from "../../auth/Protected.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Navigate } from "react-router-dom";
export default function SignInPage() {
  const { user } = useAuth();
  return user ? <Navigate to="/account" replace /> : <SignInCard text="Sign in to see your tickets or register a performance." />;
}
