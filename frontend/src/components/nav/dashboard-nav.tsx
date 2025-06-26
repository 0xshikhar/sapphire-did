"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavItem } from "@/config/dashboard"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = item.icon ? Icons[item.icon as keyof typeof Icons] : Icons.arrowRight

        return (
          item.href && (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent" : "transparent",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          )
        )
      })}
    </nav>
  )
}
