import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Heart, LogOut, Menu, Search, Shield, User, UserCircle2, X } from "lucide-react";
import "./Navbar.css";

const publicLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/campaigns", label: "المشاريع" },
  { href: "/about", label: "عن الجمعية" },
  { href: "/impact", label: "التقارير" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/bylaws", label: "الأهداف النظامية", mobileOnly: true },
];
const desktopLinks = publicLinks.filter((item) => !item.mobileOnly);

export function Navbar() {
  const { user, logout } = useAuth();
  const { unread } = useNotifications();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const roleLinks = user ? [
    ...(["admin", "accountant", "editor", "manager"].includes(user.role || "") ? [{ href: "/admin", label: "لوحة التحكم" }] : []),
    ...(user.role === "employee" ? [{ href: "/employee", label: "لوحة الموظف" }] : []),
    ...(user.role === "delivery" ? [{ href: "/delivery", label: "لوحة المندوب" }] : []),
  ] : [];
  const isPublicLinkActive = (href: string) =>
    location === href || (href === "/campaigns" && location.startsWith("/campaigns"));

  return (
    <>
      <header className="ab-site-header sticky top-0 z-50" dir="rtl">
        <div className="ab-nav-inner mx-auto max-w-[1440px]">
          <Link href="/" className="ab-nav-brand" aria-label="جمعية مقارئ البيان — الرئيسية">
            <span className="ab-nav-mark" aria-hidden="true">
              <img src="/images/albayan-official-logo.png" alt="" />
            </span>
            <span className="ab-nav-brand-copy" aria-hidden="true">
              <strong>جمعية مقارئ البيان</strong>
              <small>لتعليم القرآن الكريم</small>
            </span>
          </Link>

          <nav className="ab-nav-links" aria-label="التنقل العام">
            {desktopLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isPublicLinkActive(item.href) ? "page" : undefined}
                className="ab-nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ab-nav-actions">
            <Link href="/donate" className="ab-nav-donate" data-testid="button-donate-nav">
              <Heart aria-hidden="true" />
              <span>تبرع الآن</span>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ab-nav-account">
                    <UserCircle2 aria-hidden="true" />
                    <span>حسابي</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 border-slate-200 bg-white">
                  <DropdownMenuItem asChild><Link href="/profile" className="flex w-full items-center gap-2"><UserCircle2 className="h-4 w-4" /> الملف الشخصي</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/notifications" className="flex w-full items-center gap-2"><Bell className="h-4 w-4" /> الإشعارات {unread > 0 ? `(${unread})` : ""}</Link></DropdownMenuItem>
                  {roleLinks.map((item) => <DropdownMenuItem key={item.href} asChild><Link href={item.href} className="flex w-full items-center gap-2"><Shield className="h-4 w-4" /> {item.label}</Link></DropdownMenuItem>)}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-[#985744] focus:text-[#985744]" onClick={() => logout()}>
                    <LogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="ab-nav-account">
                <User aria-hidden="true" />
                <span>حسابي</span>
              </Link>
            )}

            <Link href="/notifications" className="ab-nav-icon-link ab-nav-notifications" aria-label={`الإشعارات${unread ? `، ${unread} غير مقروءة` : ""}`}>
              <Bell aria-hidden="true" />
              {unread > 0 && <span className="ab-nav-unread">{unread > 9 ? "9+" : unread}</span>}
            </Link>

            <Link href="/track-donation" className="ab-nav-icon-link ab-nav-search" aria-label="البحث عن تبرع">
              <Search aria-hidden="true" />
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="ab-nav-menu" aria-label="فتح القائمة">
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(88vw,360px)] overflow-y-auto border-slate-200 bg-white p-0">
                <div className="border-b border-slate-200 bg-white p-5">
                  <img src="/images/albayan-official-logo.png" alt="جمعية مقارئ البيان" className="h-12 w-40 rounded-md bg-white p-1 object-contain" />
                  <p className="mt-3 text-xs leading-6 text-slate-600">تعليم القرآن الكريم للناطقين بغير العربية</p>
                </div>
                <nav className="space-y-1 border-b border-slate-200 p-3" aria-label="التنقل العام">
                  {publicLinks.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} aria-current={isPublicLinkActive(item.href) ? "page" : undefined} className="ab-nav-mobile-link">
                      {item.label}
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-sm px-4 py-3 text-sm font-bold text-slate-700 hover:bg-[#f3fcf6]"><UserCircle2 className="h-4 w-4" /> الملف الشخصي</Link>
                      <Link href="/notifications" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-sm px-4 py-3 text-sm font-bold text-slate-700 hover:bg-[#f3fcf6]"><Bell className="h-4 w-4" /> الإشعارات {unread > 0 ? `(${unread})` : ""}</Link>
                      {roleLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-sm px-4 py-3 text-sm font-bold text-slate-700 hover:bg-[#f3fcf6]"><Shield className="h-4 w-4" /> {item.label}</Link>)}
                      <button onClick={() => { logout(); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4" /> تسجيل الخروج</button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-sm px-4 py-3 text-sm font-bold text-slate-700 hover:bg-[#f3fcf6]"><User className="h-4 w-4" /> تسجيل الدخول</Link>
                  )}
                </nav>
                <div className="p-4">
                  <Link href="/donate" onClick={() => setIsOpen(false)} className="ab-nav-mobile-donate">
                    <Heart className="h-4 w-4" /> تبرع الآن
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
