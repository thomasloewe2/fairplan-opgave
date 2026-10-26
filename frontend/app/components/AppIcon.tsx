import type { ReactNode } from "react";

// Small outline icon set; no extra dependency or changes to the package lockfile.
export type AppIconName =
  | "dashboard"
  | "calendar"
  | "building"
  | "shield"
  | "briefcase"
  | "users"
  | "arrow-up-right"
  | "chevron-right";

const paths: Record<AppIconName, ReactNode> = {
  dashboard: <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </>,
  calendar: <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </>,
  building: <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 21v-4h6v4M8 8h2M14 8h2M8 12h2M14 12h2" />
  </>,
  shield: <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
  briefcase: <>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 12c3 2 6 3 10 3s7-1 10-3" />
  </>,
  users: <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
  "arrow-up-right": <path d="M7 17 17 7M7 7h10v10" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
};

export function AppIcon({ name, size = 18, className }: {
  name: AppIconName;
  size?: number;
  className?: string;
}) {
  return <svg
    aria-hidden="true"
    focusable="false"
    className={`app-icon ${className ?? ""}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >{paths[name]}</svg>;
}
