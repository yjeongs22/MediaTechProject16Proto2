import React, { useEffect, useState } from "react";
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

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("planpickUser") || "null") as { userId: string; name?: string } | null;
  } catch {
    return null;
  }
}

export function TopNav() {
  const [location] = useLocation();
  const [user, setUser] = useState(readCurrentUser);

  useEffect(() => {
    const update = () => setUser(readCurrentUser());
    window.addEventListener("storage", update);
    window.addEventListener("planpick-user-change", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("planpick-user-change", update);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  const displayName = user?.name || user?.userId || "로그인";

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center">
        <Link href="/">
          <img src={logoImg} alt="PlanPick" data-testid="logo" className="h-8 w-auto cursor-pointer object-contain" />
        </Link>
      </div>

      <div className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}>
            <span
              data-testid={`link-${label}`}
              className={`cursor-pointer pb-1 text-sm font-medium transition-colors ${
                isActive(href) ? "border-b-2 border-indigo-600 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-slate-100" data-testid="btn-notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>
        <Link href="/login">
          <div className="flex cursor-pointer items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-slate-50" data-testid="btn-profile">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[90px] truncate text-sm font-black text-slate-700">{displayName}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </div>
  );
}
