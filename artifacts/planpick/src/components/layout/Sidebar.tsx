import React from "react";
import { Link, useLocation } from "wouter";
import { Bell, BookOpen, CalendarDays, Home, Search, Settings, ShoppingCart } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, href: "/", label: "홈" },
  { icon: CalendarDays, href: "/results", label: "내 시간표" },
  { icon: BookOpen, href: "/courses", label: "강의목록" },
  { icon: Search, href: "/search", label: "과목검색" },
  { icon: ShoppingCart, href: "/request", label: "희망과목" },
  { icon: Bell, href: "/notifications", label: "알림" },
];

export function Sidebar() {
  const [location] = useLocation();

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(`${href}/`);
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-20 shrink-0 flex-col items-center bg-white py-6 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
      <div className="flex w-full flex-1 flex-col items-center gap-4">
        {NAV_ITEMS.map(({ icon: Icon, href, label }) => {
          const active = isActive(href);
          return (
            <Link key={label} href={href}>
              <div
                title={label}
                data-testid={`nav-${label}`}
                className={`group flex w-full cursor-pointer flex-col items-center gap-1 py-2 transition-colors hover:bg-gray-50 ${
                  active ? "text-[#5B4CF2]" : "text-gray-400"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    active ? "bg-[#5B4CF2] text-white shadow-[0_4px_20px_-2px_rgba(91,76,242,0.28)]" : "group-hover:text-[#5B4CF2]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`mt-1 text-[10px] font-semibold ${active ? "text-[#5B4CF2]" : "text-gray-500"}`}>{label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/settings">
        <div title="설정" data-testid="nav-settings" className="group flex w-full cursor-pointer flex-col items-center gap-1 py-2 text-gray-400 transition-colors hover:bg-gray-50">
          <Settings className="h-5 w-5 group-hover:text-[#5B4CF2]" />
          <span className="mt-1 text-[10px] font-semibold text-gray-500">설정</span>
        </div>
      </Link>
    </aside>
  );
}
