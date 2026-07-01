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
    <div className="fixed left-0 top-0 z-50 flex h-full w-[60px] flex-col items-center border-r border-border bg-white py-4">
      <div className="mt-4 flex w-full flex-col items-center gap-5">
        {NAV_ITEMS.map(({ icon: Icon, href, label }) => (
          <Link key={label} href={href}>
            <div
              title={label}
              data-testid={`nav-${label}`}
              className={`cursor-pointer rounded-full p-3 transition-colors ${
                isActive(href) ? "bg-indigo-100 text-indigo-600" : "text-muted-foreground hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>
      <div className="mb-4 mt-auto">
        <Link href="/settings">
          <div title="설정" data-testid="nav-settings" className="cursor-pointer rounded-full p-3 text-muted-foreground transition-colors hover:bg-slate-100">
            <Settings className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
