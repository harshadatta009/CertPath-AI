import {
  LayoutDashboard,
  Map,
  FileQuestion,
  Layers,
  ScrollText,
  MessagesSquare,
  RefreshCw,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Your study overview" },
  { label: "Roadmap", href: "/roadmap", icon: Map, description: "Day-by-day study plan" },
  { label: "Questions", href: "/questions", icon: FileQuestion, description: "Practice exam questions" },
  { label: "Flashcards", href: "/flashcards", icon: Layers, description: "Spaced-repetition cards" },
  { label: "Cheat Sheets", href: "/cheatsheets", icon: ScrollText, description: "Topic quick references" },
  { label: "Interview", href: "/interview", icon: MessagesSquare, description: "Interview preparation" },
  { label: "Revision", href: "/revision", icon: RefreshCw, description: "Final revision plans" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, description: "Readiness & insights" },
  { label: "Settings", href: "/settings", icon: Settings, description: "Provider & API key" },
];
