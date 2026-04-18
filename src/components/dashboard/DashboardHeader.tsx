import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin } from "lucide-react";

export function DashboardHeader() {
  const { user, signOut } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="gradient-primary p-3 rounded-2xl shadow-lg">
          <MapPin className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground">Welcome to your Malmö dashboard</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </header>
  );
}
