"use client";
import { usePathname } from "next/navigation";
import { Bell, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const titles: Record<string, { title: string; sub: string }> = {
  "/": { title: "Overview", sub: "Platform health at a glance" },
  "/users": { title: "Users", sub: "Manage all registered accounts" },
  "/subscriptions": {
    title: "Subscriptions",
    sub: "Revenue and billing management",
  },
  "/notifications": {
    title: "Broadcasts",
    sub: "Send push notifications to users",
  },
  "/ai-usage": { title: "AI Usage", sub: "OpenAI request tracking and costs" },
  "/health": { title: "App Health", sub: "Infrastructure and cron job status" },
  "/content": { title: "Content", sub: "Flags, data exports, deletion queue" },
  "/settings": { title: "Settings", sub: "Platform configuration" },
};

export function Header() {
  const path = usePathname();
  const info = titles[path] ?? { title: "Dashboard", sub: "" };
  const router = useRouter();
  const logout = async () => {
    await api.adminLogout();
    router.push("/login");
  };
  return (
    <header className="h-16 border-b border-white/8 flex items-center justify-between px-6 bg-[#0d0d0d] flex-shrink-0">
      <div>
        <h1 className="font-display font-bold text-base text-white tracking-tight leading-tight">
          {info.title}
        </h1>
        <p className="text-xs text-[#888] mt-0.5">{info.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#888]">
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          className="p-1.5 text-[#888] hover:text-white transition-colors"
          title="Refresh"
          onClick={() => window.dispatchEvent(new Event("dashboard:refresh"))}
        >
          <RefreshCw size={15} />
        </button>
        <button
          className="p-1.5 text-[#888] hover:text-white transition-colors relative"
          title="Alerts"
        >
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <button
          onClick={logout}
          title="Sign out"
          className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-sm font-bold text-white hover:bg-red-900/40 transition-colors"
        >
          A
        </button>
      </div>
    </header>
  );
}
