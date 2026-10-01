import {
  LayoutDashboard,
  FolderClosed,
  ScrollText,
  FileStack,
  MessagesSquare,
  ShieldQuestion,
  Scale,
  Gavel,
  Globe2,
  BookMarked,
  History,
  Settings as SettingsIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Build your case",
    items: [
      { path: "/case", label: "My case", icon: FolderClosed },
      { path: "/transcript", label: "Interview transcript", icon: ScrollText },
      { path: "/documents", label: "Documents & evidence", icon: FileStack },
    ],
  },
  {
    label: "Practice & review",
    items: [
      { path: "/hearing", label: "Mock hearing", icon: MessagesSquare },
      { path: "/hearing/bamf", label: "BAMF simulation", icon: ShieldQuestion },
      { path: "/hearing/lawyer", label: "Lawyer review", icon: Scale },
      { path: "/hearing/judge", label: "Judge evaluation", icon: Gavel },
    ],
  },
  {
    label: "Research",
    items: [
      { path: "/country-information", label: "Country information", icon: Globe2 },
      { path: "/legal-sources", label: "Legal sources", icon: BookMarked },
    ],
  },
  {
    label: "Records",
    items: [
      { path: "/sessions", label: "Previous sessions", icon: History },
      { path: "/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];
