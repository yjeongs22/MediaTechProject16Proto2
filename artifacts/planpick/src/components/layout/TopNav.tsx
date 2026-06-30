import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logoImg from "@assets/image-Photoroom_1782734124454.png";
import { getCurrentUser } from "@/lib/auth";

const NAV_LINKS = [
  { label: "대시보드", href: "/" },
  { label: "수강신청", href: "/request" },
  { label: "시간표", href: "/results" },
  { label: "졸업요건", href: "/" },
  { label: "상담AI", href: "/" },
  { label: "마이페이지", href: "/login" },
];

export function TopNav() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    const update = () => setUser(getCurrentUser());
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

  function logout() {
    localStorage.removeItem("planpickUser");
    window.dispatchEvent(new Event("planpick-user-change"));
    setLocation("/login");
  }

  const displayName = user?.name || user?.userId || "로그인";

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <Link href="/">
        <img src={logoImg} alt="PlanPick" data-testid="logo" className="h-8 w-auto cursor-pointer object-contain" />
      </Link>

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

      <div className="flex items-center gap-3">
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
          </div>
        </Link>

        {user && (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
}
