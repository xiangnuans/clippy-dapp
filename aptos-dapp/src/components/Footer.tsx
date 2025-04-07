"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, User } from "lucide-react";
import { memo, useCallback } from "react";

const navItems = [
  {
    label: "Home",
    icon: Home,
    path: "/",
    activeOn: [
      "/",
      "/customize-agent",
      "/identity-verification",
      "/knowledge-base",
    ],
  },
  {
    label: "Market",
    icon: ShoppingBag,
    path: "/ai-agents",
    activeOn: ["/ai-agents", "/market", "/buy-robot"],
  },
  {
    label: "Profile",
    icon: User,
    path: "/my-assets",
    activeOn: ["/my-assets", "/profile", "/your-robot"],
  },
];

const NavItem = memo(
  ({
    item,
    isActive,
    onClick,
  }: {
    item: (typeof navItems)[0];
    isActive: boolean;
    onClick: (path: string) => void;
  }) => (
    <button
      onClick={() => onClick(item.path)}
      className={`flex flex-col items-center space-y-1 ${
        isActive ? "text-[#3730A3]" : "text-gray-400 hover:text-gray-300"
      }`}
    >
      <item.icon className="h-6 w-6" />
      <span className="text-xs">{item.label}</span>
    </button>
  )
);

NavItem.displayName = "NavItem";

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = useCallback(
    (path: string) => {
      if (pathname !== path) {
        router.push(path);
      }
    },
    [pathname, router]
  );

  const isActive = useCallback(
    (item: (typeof navItems)[0]) => {
      return item.activeOn.includes(pathname);
    },
    [pathname]
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#141416] border-t border-gray-800">
      <div className="max-w-md mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item)}
              onClick={handleNavigation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
