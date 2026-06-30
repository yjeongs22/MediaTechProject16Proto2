import React from "react";
import { Link, useLocation } from "wouter";
import { Bell, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logoImg from "@assets/image-Photoroom_1782734124454.png";

const NAV_LINKS = [
  { label: "대시보드", href: "/" },
  { label: "수강신청", href: "/request" },
  { label: "시간표", href: "/results" },
  { label: "공모전", href: "/contests" },
  { label: "상담AI", href: "/" },
  { label: "마이페이지", href: "/login" },
  { label: "Admin", href: "/admin" },
];

export function TopNav() {
  const [location] = useLocation();

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  return (
    <div className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center">
        <Link href="/">
          <img
            src={logoImg}
            alt="PlanPick"
            data-testid="logo"
            className="h-8 w-auto cursor-pointer object-contain"
          />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}>
            <span
              data-testid={`link-${label}`}
              className={`text-sm font-medium cursor-pointer transition-colors pb-1 ${
                isActive(href)
                  ? "text-foreground border-b-2 border-indigo-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 text-muted-foreground hover:bg-slate-100 rounded-full transition-colors relative"
          data-testid="btn-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <Link href="/login">
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors"
          data-testid="btn-profile"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-indigo-100 text-indigo-700">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        </Link>
      </div>
    </div>
  );
}
