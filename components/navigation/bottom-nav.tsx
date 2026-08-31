"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, CheckSquare, User } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    if (pathname === '/login') return null;

    const navItems = [
        { name: "Feed", href: "/", icon: Home },
        { name: "Check In", href: "/check-in", icon: CheckSquare},
        { name: "Add Goal", href: "/add-goal", icon: PlusSquare},
        { name: "Profile", href: "/profile", icon: User}
    ];

    return (
        <nav className="sticky bottom-0 w-full border-t bg-background/95 backgdrop-blur pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Check if the current URL matches the button's link
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
                            <span className="text-[10px]">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    )
}