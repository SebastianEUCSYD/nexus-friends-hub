import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth", { replace: true });
    } else if (!profile) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/chat", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-soft">
      <div className="h-16 w-16 rounded-2xl gradient-primary animate-pulse" />
    </div>
  );
};

export default Index;
