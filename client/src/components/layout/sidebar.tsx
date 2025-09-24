import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-camera", label: "Assessment" },
    { path: "/dashboard", icon: "fas fa-chart-bar", label: "Dashboard" },
    { path: "/flagged-cases", icon: "fas fa-flag", label: "Flagged Cases" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">SafetyGuard AI</h1>
            <p className="text-sm text-muted-foreground">Compliance System</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2" data-testid="nav">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                location === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <i className={`${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-secondary-foreground text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Safety Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
