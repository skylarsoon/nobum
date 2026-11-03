"use client"

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, CheckSquare, User, TrendingUp, Users } from "lucide-react";

// Must render inside a <Link> to read that link's pending state
function NavItemContent({ name, Icon, isActive }: { name: string; Icon: typeof Home; isActive: boolean }) {
    const { pending } = useLinkStatus();
    return (
        <span className={`flex flex-col items-center justify-center space-y-1 ${pending ? "animate-pulse" : ""}`}>
            <Icon className={`h-5 w-5 ${isActive || pending ? "stroke-[2.5px]" : ""}`} />
            <span className="text-[10px]">{name}</span>
        </span>
    );
}

export default function BottomNav() {
    const pathname = usePathname();

    // Logged-out pages don't get the app tabs
    if (pathname === '/login' || pathname === '/signup') return null;

    const navItems = [
        { name: "Feed", href: "/", icon: Home },
        { name: "Check In", href: "/check-in", icon: CheckSquare},
        { name: "Add Goal", href: "/add-goal", icon: PlusSquare},
        { name: "Progress", href: "/progress", icon: TrendingUp},
        { name: "Groups", href: "/groups", icon: Users},
        { name: "Profile", href: "/profile", icon: User}
    ];

    return (
        <nav className="sticky bottom-0 w-full border-t bg-background/95 backgdrop-blur pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Exactly on this tab's page: re-clicking shouldn't trigger another server render
                    const isCurrentPage = pathname === item.href;
                    // Sub-pages (e.g. /groups/abc) keep their tab highlighted
                    const isActive = item.href === "/" ? isCurrentPage : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={(e) => { if (isCurrentPage) e.preventDefault(); }}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <NavItemContent name={item.name} Icon={Icon} isActive={isActive} />
                        </Link>
                    );
                })}
            </div>
        </nav>
    )
}