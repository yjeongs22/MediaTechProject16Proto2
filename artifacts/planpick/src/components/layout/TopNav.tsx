import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logoImg from "@assets/image-Photoroom_1782734124454.png";
import { getCurrentUser } from "@/lib/auth";

const NAV_LINKS = [
  { label: "대시보드", href: "/" },
  { label: "수강신청", href: "/request" },
  { label: "시간표", href: "/results" },
  { label: "졸업요건", href: "/graduation" },
  { label: "장학금", href: "/scholarships" },
  { label: "마이페이지", href: "/mypage" },
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
    return location === href || location.startsWith(`${href}/`);
  }

  function logout() {
    localStorage.removeItem("planpickUser");
    window.dispatchEvent(new Event("planpick-user-change"));
    setLocation("/login");
  }

  const displayName = user?.name || user?.userId || "로그인";

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full shrink-0 items-center justify-between border-b border-white/40 bg-white/70 px-10 backdrop-blur-md">
      <div className="flex items-center gap-16">
        <Link href="/">
          <img src={logoImg} alt="PlanPick" data-testid="logo" className="h-8 w-auto cursor-pointer object-contain" />
        </Link>

        <nav className="hidden items-center gap-8 font-medium text-gray-600 lg:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href}>
              <span
                data-testid={`link-${label}`}
                className={`cursor-pointer transition-colors hover:text-[#5B4CF2] ${
                  isActive(href) ? "font-bold text-[#5B4CF2]" : "text-gray-600"
                }`}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/notifications">
          <button className="relative text-gray-500 transition-colors hover:text-[#5B4CF2]" data-testid="btn-notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>
        </Link>

        <Link href="/mypage">
          <div className="flex cursor-pointer items-center gap-2">
            <Avatar className="h-9 w-9 overflow-hidden border-2 border-white bg-gray-200 shadow-sm">
              <AvatarFallback className="bg-gray-200 text-gray-400">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[90px] truncate text-sm font-bold text-gray-600 xl:inline">{displayName}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </div>
        </Link>

        {user && (
          <button
            type="button"
            onClick={logout}
            className="hidden items-center gap-1 rounded-full border border-gray-100 bg-white/70 px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:text-[#5B4CF2] xl:flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}
