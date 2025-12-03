import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Fejl",
        description: "Udfyld venligst alle felter",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Fejl",
        description: "Adgangskoden skal være mindst 6 tegn",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login fejlede",
            description: error.message === "Invalid login credentials" 
              ? "Forkert email eller adgangskode" 
              : error.message,
            variant: "destructive",
          });
        } else {
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Email allerede i brug",
              description: "Prøv at logge ind i stedet",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Oprettelse fejlede",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Konto oprettet! 🎉",
            description: "Opret nu din profil",
          });
          navigate("/onboarding");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gradient-soft">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="h-20 w-20 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-glow mb-6">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {isLogin ? "Velkommen tilbage" : "Opret konto"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin 
              ? "Log ind for at fortsætte" 
              : "Kom i gang med at finde nye venner"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="Adgangskode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              "Vent..."
            ) : (
              <>
                {isLogin ? "Log ind" : "Opret konto"}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-muted-foreground">
          {isLogin ? "Har du ikke en konto?" : "Har du allerede en konto?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Opret her" : "Log ind"}
          </button>
        </p>
      </div>
    </div>
  );
}
