"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { NavItem } from "@/config/dashboard"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({})

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Check if a section should be open based on current path
  const isItemActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true
    if (item.items) {
      return item.items.some(subItem => isItemActive(subItem))
    }
    return false
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = item.icon ? Icons[item.icon as keyof typeof Icons] : Icons.arrowRight
        const isActive = isItemActive(item)
        
        // Initialize section as open if it contains the active page
        if (isActive && openSections[index] === undefined) {
          openSections[index] = true
        }

        // If it's a section with nested items
        if (item.items && item.items.length > 0) {
          return (
            <div key={index} className="space-y-1">
              <button
                onClick={() => toggleSection(index)}
                className={cn(
                  "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent/50" : "transparent"
                )}
              >
                <div className="flex items-center">
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </div>
                <div className="text-sm">
                  {openSections[index] ? (
                    <Icons.arrowRight className="h-4 w-4 transform rotate-90" />
                  ) : (
                    <Icons.arrowRight className="h-4 w-4" />
                  )}
                </div>
              </button>
              
              {openSections[index] && (
                <div className="pl-4 border-l border-border ml-3 space-y-1">
                  {item.items.map((subItem, subIndex) => {
                    const SubIcon = subItem.icon ? Icons[subItem.icon as keyof typeof Icons] : Icons.arrowRight
                    
                    return (
                      subItem.href && (
                        <Link
                          key={`${index}-${subIndex}`}
                          href={subItem.disabled ? "#" : subItem.href}
                          className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            pathname === subItem.href ? "bg-accent" : "transparent",
                            subItem.disabled && "cursor-not-allowed opacity-80"
                          )}
                        >
                          {SubIcon && <SubIcon className="mr-2 h-4 w-4" />}
                          <span>{subItem.title}</span>
                        </Link>
                      )
                    )
                  })}
                </div>
              )}
            </div>
          )
        }
        
        // If it's a single item with href
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
