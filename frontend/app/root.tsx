import { NavLink, Outlet, isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { AppIcon, type AppIconName } from "./components/AppIcon";
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "FairPlan | Administration" },
  { name: "description", content: "Administration af perioder, organisering og personale" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="da">
    <head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><Meta /><Links /></head>
    <body>{children}<ScrollRestoration /><Scripts /></body>
  </html>;
}

const menu: { to: string; label: string; icon: AppIconName; end?: boolean }[] = [
  { to: "/", label: "Overblik", icon: "dashboard", end: true },
  { to: "/perioder", label: "Perioder", icon: "calendar" },
  { to: "/organisering", label: "Organisering", icon: "building" },
  { to: "/adgangsstyring/brugere", label: "Adgangsstyring", icon: "shield" },
  { to: "/adgangsstyring/ansaettelser", label: "Ansættelser", icon: "briefcase" },
  { to: "/personale", label: "Personale", icon: "users" },
];

export default function App() {
  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="FairPlan – Forside">
        <span>FairPlan</span>
      </NavLink>
      <div className="nav-label">NAVIGATION</div>
      <nav className="sidebar-nav" aria-label="Hovednavigation">
        {menu.map((entry) => <NavLink key={entry.to} to={entry.to} end={entry.end}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><AppIcon name={entry.icon} size={18} className="nav-icon" /><span>{entry.label}</span></NavLink>)}
      </nav>
      <div className="sidebar-footer">FairPlan · Vagtplanlægning</div>
    </aside>
    <div className="app-main">
      <header className="topbar">
        <span className="topbar-label">Vagtplanlægning</span>
      </header>
      <main className="main-content"><Outlet /></main>
    </div>
  </div>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? error.status === 404 ? "Siden blev ikke fundet." : error.statusText
    : error instanceof Error ? error.message : "Der opstod en uventet fejl.";
  return <main className="error-page"><h1>Der opstod en fejl</h1><p>{message}</p><a href="/">Gå til forsiden</a></main>;
}
